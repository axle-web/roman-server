import { ControllerFactory } from "@factory/controller-factory";
import Branch, { IBranch, IBranchPublic } from "@models/branch-model";
import Node, { INode, INodePublic } from "@models/node-model";
import { Model, Types } from "mongoose";
import { FolderModel } from "./folder-controller";
import { catchAsync, log } from "@utils";
import JoiSchema from "@utils/joi-schemas";
import Joi from "joi";
import caches from "src/cache";
import { Upload } from "@utils/upload";
export type GenericNodeType = INodePublic<Record<string, any>>;
export const GenericNodeModel = Node as unknown as Model<
  GenericNodeType,
  INode
>;
export type GenericFolderType = IBranchPublic<Record<string, any>>;
export const GenericFolderModel = Branch as unknown as Model<
  GenericNodeType,
  IBranch
>;

const NodeController = new ControllerFactory(GenericNodeModel);
const FolderController = new ControllerFactory(GenericFolderModel);
const appearanceCache = caches.appearance;
export const getAppData = catchAsync(async (req, res, next) => {
  const data = await GenericFolderModel.findOne({ name: "app_data" }).populate([
    "createdBy",
    {
      path: "nodes",
      populate: ["name details"],
    },
    {
      path: "branches",
      populate: [
        "name details",
        {
          path: "nodes",
          select: { id: 1, name: 1, details: 1 },
          populate: "branch",
        },
        {
          path: "branches",
          select: { id: 1, name: 1, details: 1, nodes: 1, branches: 1 },
        },
        {
          path: "branch",
          select: { id: 1, name: 1, details: 1 },
        },
      ],
    },
  ]);
  res.status(200).send(data);
});

export const postOneSlide = NodeController.updateOne({
  body: {
    title: { schema: Joi.string(), setAs: "details.title" },
    subTitle: { schema: Joi.string(), setAs: "details.subTitle" },
    cover: {
      mimetypes: ["IMAGE"],
      count: 1,
      upload: Upload.envDynamicUpload,
      setAs: "details.cover",
    },
    buttonLabel: {
      schema: Joi.string(),
      setAs: "details.buttonLabel",
    },
    buttonHref: {
      schema: Joi.string(),
      setAs: "details.buttonHref",
    },
  },
  preprocess: (req, res, next, payload) => ({
    name: `swiper-slide-${req.query?.["title"] || ""}-${
      Math.floor(Math.random() * 10000) + 1
    }`,
    branch: new Types.ObjectId(appearanceCache["swiper"]._id),
    createdBy: req.session.user!._id,
    // type: "swiper-slide-system",
    ...payload,
  }),
  postprocess: (req, res, next, payload) => {
    FolderModel.findByIdAndUpdate(payload.branch, {
      $push: { nodes: payload._id },
    }).then(async (doc) => {
      log.info(`${payload.name} appended to "${doc?.name || payload.branch}"`);
    });
  },
});

export const updateFolderBoxes = FolderController.updateOne({
  key: "name",
  query: {
    name: { schema: JoiSchema.name },
  },
  body: {
    branches: {
      schema: Joi.array().items(JoiSchema._id.optional()),
    },
  },
  postprocess: (req, res, next, payload) => payload.populate("branches"),
});

export const updateBanner = NodeController.updateOne({
  key: "name",
  query: {
    name: {
      schema: JoiSchema.name,
    },
  },
  body: {
    title: { schema: Joi.string(), setAs: "details.title" },
    body: { schema: Joi.string(), setAs: "details.body" },
    cover: {
      mimetypes: ["IMAGE"],
      count: 1,
      upload: Upload.envDynamicUpload,
      setAs: "details.cover",
    },
  },
});

export const updateFileCarousel = FolderController.updateOne({
  key: "name",
  query: {
    name: { schema: JoiSchema.name },
  },
  body: {
    nodes: {
      schema: Joi.array().items(JoiSchema._id.optional()),
    },
  },
  postprocess: (req, res, next, payload) =>
    payload.populate([{ path: "nodes", populate: "branch" }]),
});

export const updateContactUs = NodeController.updateOne({
  key: "name",
  query: {
    name: {
      schema: JoiSchema.name,
    },
  },
  body: {
    email: {
      schema: JoiSchema.email.optional(),
      setAs: "details.email",
    },
    phone: {
      schema: Joi.string(),
      setAs: "details.phone",
    },
    address: {
      schema: Joi.string(),
      setAs: "details.address",
    },
    workingFrom: {
      schema: Joi.number(),
      setAs: "details.workingFrom",
    },
    workingTo: {
      schema: Joi.number(),
      setAs: "details.workingTo",
    },
  },
});

export const updateSocials = NodeController.updateOne({
  key: "name",
  query: {
    name: {
      schema: JoiSchema.name,
    },
  },
  body: {
    facebook: {
      schema: Joi.string(),
      setAs: "details.facebook",
    },
    instagram: {
      schema: Joi.string(),
      setAs: "details.instagram",
    },
    pinterest: {
      schema: Joi.string(),
      setAs: "details.pinterest",
    },
    twitter: {
      schema: Joi.string(),
      setAs: "details.twitter",
    },
    youtube: {
      schema: Joi.string(),
      setAs: "details.youtube",
    },
  },
});

export const updateFooter = NodeController.updateOne({
  key: "_id",
  query: {
    _id: {
      schema: JoiSchema._id,
    },
  },
  body: {
    subTitle: {
      schema: Joi.string(),
    },
    community: {
      schema: Joi.array().items(
        Joi.object({ label: Joi.string(), href: Joi.string() })
      ),
    },
  },
});
