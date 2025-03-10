import { ControllerFactory } from "@factory/controller-factory";
import JoiSchema from "@utils/joi-schemas";
import Branch, { IBranch, IBranchPublic } from "@models/branch-model";
import { AppError, catchAsync, log } from "@utils";
import { Model } from "mongoose";
import { Upload } from "@utils/upload";
import Joi from "joi";

export type FolderDocument = IBranchPublic<{ cover?: string }>;
export const FolderModel = Branch as unknown as Model<FolderDocument, IBranch>;

const Controller = new ControllerFactory(FolderModel);

export const getOneFolder = Controller.getOne({
  key: "slug",
  query: {
    slug: JoiSchema.name.label("Folder name"),
    ignore_v: Joi.bool().default(false),
  },
  populate: [
    "createdBy",
    {
      path: "nodes",
      populate: [
        "name tags",
        {
          path: "branch",
          select: { _id: 1, name: 1, details: 1 },
        },
      ],
    },
    {
      path: "branches",
      populate: ["tags"],
    },
    "tags",
  ],
  postprocess: (req, res, next, payload) => {
    if (!req.query?.ignore_v)
      payload
        .updateOne({ $inc: { views: 1 } })
        .then(() => log.debug(`branch "${payload?.name}" views updated`));
  },
});

export const getAllFolder = Controller.getAll({
  query: {
    branch: JoiSchema._id.label("Folder id").optional(),
    // ignore_v: Joi.bool().default(false),
    system: Joi.bool().default(false),
  },
  sort: ["createdAt", "views"],
  pagination: true,
  populate: [{ path: "branch", select: "_id name details" }, "nodes", "tags"],
  // postprocess: (req, res, next, payload) => {
  //   if (req?.query?.slug && !req.query?.ignore_v)
  //     payload
  //       .updateOne({ $inc: { views: 1 } })
  //       .then(() => log.debug(`branch "${payload?.name}" views updated`));
  // },
});

export const getAllFoldersUnique = Controller.getAll({
  query: {
    system: Joi.bool().default(false),
  },
  pagination: true,
  sort: ["createdAt", "views"],
  populate: [{ path: "branch", select: "_id name details" }, "nodes", "tags"],
  postprocess: (req, res, next, payload) =>
    payload &&
    payload.length &&
    payload.map((folder) => ({
      _id: folder._id,
      slug: folder.slug,
      details: folder.details,
    })),
});

// get all folders without a "branch"
export const getRootFolders = Controller.getAll({
  query: {},
  pagination: true,
  sort: ["createdAt", "views"],
  preprocess: (req, res, next, payload) => ({ ...payload, branch: null }),
  populate: [{ path: "branch", select: "_id name details" }, "nodes", "tags"],
});

export const postOneFolder = Controller.postOne({
  body: {
    name: {
      schema: JoiSchema.name,
    },
    cover: {
      mimetypes: ["IMAGE"],
      count: 1,
      setAs: "details.cover",
      upload: Upload.envDynamicUpload,
      async: false,
    },
    branch: {
      schema: JoiSchema._id.label("Folder id").optional(),
      async validate(val: string) {
        if (!val) return;
        const branch = await Branch.findById(val);
        if (!branch) return AppError.createDocumentNotFoundError("folder");
      },
    },
    tags: Joi.array().items(JoiSchema._id).optional(),
  },
  preprocess: (req, res, next, payload) => {
    return { ...payload, createdBy: req.session.user!._id };
  },
});

export const deleteOneFolder = Controller.getOne({
  query: {
    name: JoiSchema.name,
  },
  operation: async (req, res, next, Model) => {
    const folder = await FolderModel.findOneAndDelete({
      name: req.query["name"],
    });
    return folder;
  },
});

export const updateOneFolder = Controller.updateOne({
  key: "_id",
  query: {
    _id: JoiSchema._id.label("Folder id"),
  },
  body: {
    name: {
      schema: JoiSchema.name.optional(),
    },
    cover: {
      mimetypes: ["IMAGE"],
      count: 1,
      setAs: "details.cover",
      upload: Upload.envDynamicUpload,
    },
    tags: Joi.array().items(JoiSchema._id).optional(),
  },
});

export const sampleFolders = catchAsync(async (req, res, next) => {
  const { size } = req.query;

  if (!size) {
    throw AppError.createError(400, "Size parameter is missing", "AppError");
  }
  if (Array.isArray(size))
    throw AppError.createError(400, "Invalid size parameter", "AppError");
  const numberOfDocuments = parseInt(size as string);
  if (isNaN(numberOfDocuments) || numberOfDocuments <= 0) {
    throw AppError.createError(400, "Invalid size parameter", "AppError");
  }
  let data = await FolderModel.aggregate([
    {
      $match: {
        system: false,
      },
    },
    {
      $sample: { size: numberOfDocuments },
    },
  ]);
  // data = await FolderModel.populate(data, "branch");
  res.status(200).send(data);
});

const _passParentTags = async (parent: FolderDocument) => {
  const folders = await FolderModel.find({ branch: parent._id });
  for (const folder of folders) {
    // combine folder.tags with parent.tags and return unique tags
    folder.tags = [...new Set([...folder.tags, ...parent.tags])];
    // recursively share tags down the branch
    await _passParentTags(folder);
    await folder.save();
  }
};

export const passParentTags = catchAsync(async (req, res, next) => {
  // get requested folder by query._id
  // get all child branches
  if (!req.query.slug)
    return next(
      AppError.createError(400, "Folder name is required", "AppError")
    );
  const folder = await FolderModel.findOne({ slug: req.query.slug });
  if (!folder)
    return next(AppError.createError(404, "Folder not found", "AppError"));
  await _passParentTags(folder);
  res.status(200).send({ data: folder });
});
