import { ControllerFactory } from "@factory/controller-factory";
import JoiSchema from "@misc/joi-schemas";
import Branch, { IBranch } from "@models/branch-model";
import { INodeModel } from "@models/node-model";
import Joi from "joi";
import { Model } from "mongoose";

export type ImageDocument = IBranch<true, { cover?: string }>;

const Controller = new ControllerFactory(
    Branch as unknown as Model<ImageDocument, INodeModel>
);

export const getOneFolder = Controller.getOne({
    key: "name",
    query: {
        name: {
            schema: JoiSchema.name.label("Folder name"),
        },
    },
    populate: ["createdBy", "nodes"],
});

export const getAllFolder = Controller.getAll({});

export const postOneFolder = Controller.postOne({
    body: {
        name: {
            schema: JoiSchema.name,
        },
        details: { schema: Joi.object() },
        cover: {
            mimetypes: ["IMAGE"],
            count: 1,
            setAs: "details.cover",
        },
    },
    preprocess: (req, res, next, payload) => {
        return { ...payload, createdBy: req.session.user!._id };
    },
});
