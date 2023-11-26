import { ControllerFactory } from "@factory/controller-factory";
import JoiSchema from "@utils/joi-schemas";
import Branch from "@models/branch-model";
import Node, { INode, INodeModel } from "@models/node-model";
import { uploadtoSpaces } from "@services";
import { AppError, catchAsync, log } from "@utils";
import { readFileSync } from "fs";
import Joi from "joi";
import { Model, Types } from "mongoose";
import { FolderDocument, FolderModel } from "./folder-controller";

export type ImageDocument = INode<
  true,
  { cover: string; height?: string; width?: string; depth?: string }
>;
export const ImageModel = Node as unknown as Model<ImageDocument, INodeModel>;
const Controller = new ControllerFactory(ImageModel);

const notSystem = /system/i; // Case-insensitive regex to match "system"

export const getOneImage = Controller.getOne({
  key: "name",
  query: {
    name: {
      schema: JoiSchema.name,
    },
  },
  populate: ["branch"],
});

export const getAllImage = Controller.getAll({
  pagination: true,
  populate: [{ path: "branch", select: "_id name" }],
  preprocess: (req, res, next, payload) => {
    if (!payload["type"]) return { ...payload, type: { $not: notSystem } };
  },
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
      async upload(file) {
        const { path } = await uploadtoSpaces(file);
        return path;
      },
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
  },
  preprocess: (req, res, next, payload) => ({
    ...payload,
    createdBy: req.session.user!._id,
  }),
  postprocess: (req, res, next, payload) => {
    FolderModel.findById(payload.branch).then(async (doc) => {
      doc?.nodes.push(payload._id);
      if (doc?.details) {
        if (!doc?.details?.cover) {
          doc.details.cover = payload.details.cover;
        }
      } else {
        doc!.details = { cover: payload.details.cover };
      }
      doc?.save().then((document) => {
        log.info(
          `${payload.name} appened to branch "${document?.name || payload.branch
          }"`
        );
      });
    });
  },
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

export const updateOneImage = Controller.postOne({
  body: {
    name: {
      schema: JoiSchema.name,
    },
    cover: {
      mimetypes: ["IMAGE"],
      count: 1,
      setAs: "details.cover",
      async upload(file) {
        const { path } = await uploadtoSpaces(file);
        return path;
      },
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
  },
  operation: async (req, res, next, Model) => {
    if (!req["query"].id || req["query"].id == undefined)
      throw AppError.createError(
        400,
        "Folder id missing from request",
        "ValidationError"
      );
    const image = await ImageModel.findByIdAndUpdate(
      req["query"].id,
      req["body"]
    );
    return image;
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
        type: {
          $not: notSystem,
        },
      },
    },
    {
      $sample: { size: numberOfDocuments },
    },
  ]);
  data = await ImageModel.populate(data, "branch");
  res.status(200).send(data);
});
