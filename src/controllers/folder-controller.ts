import { ControllerFactory } from "@factory/controller-factory";
import JoiSchema from "@utils/joi-schemas";
import Branch, { IBranch, IBranchPublic } from "@models/branch-model";
import { AppError, catchAsync, log } from "@utils";
import Joi from "joi";
import { Model } from "mongoose";
import { Upload } from "@utils/upload";

export type FolderDocument = IBranchPublic<{ cover?: string }>;
export const FolderModel = Branch as unknown as Model<FolderDocument, IBranch>;

const Controller = new ControllerFactory(FolderModel);

const notSystem = /system/i; // Case-insensitive regex to match "system"

export const getOneFolder = Controller.getOne({
  key: "slug",
  query: {
    slug: {
      schema: JoiSchema.name.label("Folder name"),
    },
  },
  populate: [
    "createdBy",
    {
      path: "nodes",
      populate: [
        "name details",
        {
          path: "branch",
          select: { id: 1, name: 1, details: 1 },
        },
      ],
    },
    "branches",
  ],
});

export const getAllFolder = Controller.getAll({
  query: {
    type: {
      schema: Joi.string(),
    },
    branch: {
      schema: JoiSchema._id.optional(),
    },
  },
  preprocess: (req, res, next, payload) => {
    if (!payload["type"]) return { ...payload, type: { $not: notSystem } };
  },
  pagination: true,
  populate: [
    { path: "branch", select: "_id name details" },
    "nodes",
    { path: "branches", select: "_id name details" },
  ],
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
    },
    branch: {
      schema: JoiSchema._id.label("Folder id").optional(),
      async validate(val: string) {
        if (!val) return;
        const branch = await Branch.findById(val);
        if (!branch) return AppError.createDocumentNotFoundError("folder");
      },
    },
    type: {
      schema: Joi.string().valid("category", "collection", "album"),
    },
  },
  preprocess: (req, res, next, payload) => {
    return { ...payload, createdBy: req.session.user!._id };
  },
  postprocess: (req, res, next, payload) => {
    FolderModel.findByIdAndUpdate(payload.branch, {
      $push: {
        branches: payload._id,
      },
    }).then((doc) => {
      log.info(
        `branch ${payload.name} appened to branch "${
          doc?.name || payload.branch
        }"`
      );
    });
  },
});

export const deleteOneFolder = Controller.getOne({
  query: {
    name: {
      schema: JoiSchema.name,
    },
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
    _id: JoiSchema._id,
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
      required: false,
    },
    type: {
      schema: Joi.string(),
    },
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
        type: {
          $not: notSystem,
        },
      },
    },
    {
      $sample: { size: numberOfDocuments },
    },
  ]);
  // data = await FolderModel.populate(data, "branch");
  res.status(200).send(data);
});
