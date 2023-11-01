import { ControllerFactory } from "@factory/controller-factory";
import Branch, { IBranch } from "@models/branch-model";
import Node, { INode } from "@models/node-model";
import { Model } from "mongoose";
import { FolderModel } from "./folder-controller";
import { AppError, log } from "@utils";
import { readFileSync } from "fs";
import JoiSchema from "@utils/joi-schemas";
import Joi from "joi";

export type GenericNodeType = INode<true, Record<string, any>>;
export const GenericNodeModel = Node as unknown as Model<
  GenericNodeType,
  INode
>;
export type GenericFolderType = IBranch<true, Record<string, any>>;
export const GenericFolderModel = Branch as unknown as Model<
  GenericNodeType,
  IBranch
>;

const NodeController = new ControllerFactory(GenericNodeModel);
const FolderController = new ControllerFactory(GenericFolderModel);

export const postOneImage = NodeController.postOne({
  body: {
    name: {
      schema: JoiSchema.name,
    },
    branch: {
      schema: JoiSchema._id.label("branch id"),
      async validate(val) {
        const branch = await Branch.findById(val);
        if (!branch) return AppError.createDocumentNotFoundError("branch");
      },
    },
    content: {
      schema: Joi.string(),
    },
    cover: {
      mimetypes: ["IMAGE"],
      count: 1,
      required: true,
      setAs: "details.cover",
      async upload(file) {
        // const { path } = await uploadtoSpaces(file);
        // return path;
        return `data:image/png;base64,${readFileSync(file.path, {
          encoding: "base64",
        })}`;
      },
    },
  },
  preprocess: (req, res, next, payload) => ({
    ...payload,
    createdBy: req.session.user!._id,
  }),
  postprocess: (req, res, next, payload) => {
    FolderModel.findByIdAndUpdate(payload.branch, {
      $push: { nodes: payload._id },
    }).then(async (doc) => {
      log.info(`${payload.name} appened to "${doc?.name || payload.branch}"`);
    });
  },
});
