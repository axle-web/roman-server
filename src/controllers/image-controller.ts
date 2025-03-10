import { ControllerFactory } from "@factory/controller-factory";
import JoiSchema from "@utils/joi-schemas";
import Branch from "@models/branch-model";
import Node, { INodeModel, INodePublic } from "@models/node-model";
import { AppError, catchAsync, log } from "@utils";
import Joi from "joi";
import { Model } from "mongoose";
import { Upload } from "@utils/upload";

export type ImageDocument = INodePublic<{
  cover: string;
  dimensions?: {
    height?: string;
    width?: string;
    depth?: string;
    on_wall?: string;
    on_ceiling?: string;
  };
}>;

export const ImageModel = Node as unknown as Model<ImageDocument, INodeModel>;

const Controller = new ControllerFactory(ImageModel);

export const getOneImage = Controller.getOne({
  key: "slug",
  query: {
    slug: JoiSchema.name.label("Image name"),
  },
  populate: [{ path: "branch", select: "_id name details path" }, "tags"],
});

export const getAllImageUnique = Controller.getAll({
  query: {
    system: Joi.bool().default(false),
  },
  pagination: true,
  sort: ["createdAt", "views"],
  populate: [{ path: "branch", select: "_id name" }, "tags"],
  postprocess: (req, res, next, payload) =>
    payload &&
    payload.length &&
    payload.map((image) => ({
      _id: image._id,
      slug: image.slug,
      branch: image.branch,
      details: image.details,
    })),
});

export const getAllImage = Controller.getAll({
  query: {
    branch: JoiSchema._id.label("Folder id").optional(),
    ignore_v: Joi.bool().default(false),
  },
  pagination: true,
  sort: ["createdAt", "views"],
  populate: [{ path: "branch", select: "_id name" }, "tags"],
});

export const postOneImage = Controller.postOne({
  body: {
    name: {
      schema: JoiSchema.name,
    },
    branch: {
      schema: JoiSchema._id.label("branch id"),
      async validate(val: string) {
        const branch = await Branch.findById(val);
        if (!branch) return AppError.createDocumentNotFoundError("branch");
      },
    },
    cover: {
      mimetypes: ["IMAGE"],
      count: 1,
      required: true,
      setAs: "details.cover",
      upload: Upload.envDynamicUpload,
    },
    length: {
      schema: Joi.number().min(1),
      setAs: "details.dimensions.length",
    },
    height: {
      schema: Joi.number().min(1),
      setAs: "details.dimensions.height",
    },
    depth: {
      schema: Joi.number().min(1),
      setAs: "details.dimensions.depth",
    },
    width: {
      schema: Joi.number().min(1),
      setAs: "details.dimensions.width",
    },
    on_wall: {
      schema: Joi.number().min(1),
      setAs: "details.dimensions.on_wall",
    },
    on_ceiling: {
      schema: Joi.number().min(1),
      setAs: "details.dimensions.on_ceiling",
    },
    tags: Joi.array().items(JoiSchema._id).optional(),
  },
  preprocess: (req, res, next, payload) => ({
    ...payload,
    createdBy: req.session.user!._id,
  }),
});

export const deleteOneImage = Controller.getOne({
  query: {
    name: {
      schema: JoiSchema.name,
    },
  },
  operation: async (req, res, next, Model) => {
    await ImageModel.findOneAndDelete({
      name: req.query["name"],
    });
  },
});

export const updateOneImage = Controller.updateOne({
  key: "_id",
  query: {
    _id: JoiSchema._id.label("Image id"),
  },
  body: {
    cover: {
      mimetypes: ["IMAGE"],
      count: 1,
      setAs: "details.cover",
      upload: Upload.envDynamicUpload,
    },
    length: {
      schema: Joi.number().min(1),
      setAs: "details.length",
    },
    height: {
      schema: Joi.number().min(1),
      setAs: "details.height",
    },
    depth: {
      schema: Joi.number().min(1),
      setAs: "details.depth",
    },
    width: {
      schema: Joi.number().min(1),
      setAs: "details.width",
    },
    on_wall: {
      schema: Joi.number().min(1),
      setAs: "details.on_wall",
    },
    on_ceiling: {
      schema: Joi.number().min(1),
      setAs: "details.on_ceiling",
    },
    tags: Joi.array().items(JoiSchema._id).optional(),
  },
});

export const sampleImages = catchAsync(async (req, res, next) => {
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
  let data = await ImageModel.aggregate([
    {
      $match: {
        system: false,
      },
    },
    {
      $sample: { size: numberOfDocuments },
    },
  ]);
  data = await ImageModel.populate(data, "branch");
  res.status(200).send(data);
});
