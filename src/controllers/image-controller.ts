import { ControllerFactory } from "@factory/controller-factory";
import JoiSchema from "@utils/joi-schemas";
import Branch from "@models/branch-model";
import Node, { INode, INodeModel } from "@models/node-model";
import { uploadtoSpaces } from "@services";
import { AppError, log } from "@utils";
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
});

export const postOneImage = Controller.postOne({
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
          `${payload.name} appened to branch "${
            document?.name || payload.branch
          }"`
        );
      });
    });
    // Branch.findOneAndUpdate(
    //     {
    //         _id: payload.branch,
    //         $or: [
    //             { details: { $exists: false } },
    //             { "details.cover": { $exists: false } },
    //         ],
    //     },
    //     {
    //         "details.cover": payload.details.cover,
    //     },
    //     { new: true }
    // );
    // Branch.findById(payload.branch).then((branch)=>{
    //     branch?.nodes.push(payload._id);
    // if (!branch?.details || ) {
    //     branch?.details = { cover: payload.details.cover };
    // } else {
    //     if (!branch.details?.cover)
    //         branch.details.cover = payload.details.cover;
    // }
    // log.info(
    //     `${payload.name} appened to branch "${
    //         document?.name || payload.branch
    //     }"`
    // );
    // })

    // Branch.findByIdAndUpdate(
    //     payload.branch,
    //     [
    //         {
    //             $addFields: {
    //                 nodes: { $concatArrays: ["$nodes", [payload._id]] },
    //                 details: {
    //                     $cond: {
    //                         if: { $ifNull: "$details" },
    //                         then: { cover: payload.details.cover },
    //                         else: {
    //                             $cond: {
    //                                 if: { $not: "$details.cover" },
    //                                 then: {
    //                                     $mergeObjects: [
    //                                         "$details",
    //                                         {
    //                                             cover: payload.details
    //                                                 .cover,
    //                                         },
    //                                     ],
    //                                 },
    //                                 else: "$$REMOVE",
    //                             },
    //                         },
    //                     },
    //                 },
    //             },
    //         },
    //     ],
    //     { returnDocument: "after" }
    // ).then((document) => {
    //     log.info(
    //         `${payload.name} appened to branch "${
    //             document?.name || payload.branch
    //         }"`
    //     );
    // });
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
        // const { path } = await uploadtoSpaces(file);
        // return path;
        return `data:image/png;base64,${readFileSync(file.path, {
          encoding: "base64",
        })}`;
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
    console.log(req["query"]);
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