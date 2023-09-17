import { ControllerFactory } from "@factory/controller-factory";
import JoiSchema from "@misc/joi-schemas";
import NodeModel, { INode, INodeModel } from "@models/node-model";
import { Router } from "express";
import Joi from "joi";
import { Model } from "mongoose";
type CustomNode = INode<false, { 1: 2 }>;

const Controller = new ControllerFactory(
    NodeModel as unknown as Model<CustomNode, INodeModel>
);
const router = Router();
const postOne = Controller.postOne({
    body: {
        name: {
            schema: JoiSchema.name,
        },
        height: {
            schema: Joi.number(),
        },
        width: {
            schema: Joi.number(),
        },
        depth: {
            schema: Joi.number(),
        },
        file: {
            mimetypes: ["IMAGE"],
            // required: true,
            // parse: (file) => ({
            //     path: file.path,
            // }),
            //TODO figure out why Promise<void> is not being handled by TS
            async upload(file) {
                return { path: file.path };
            },
            // required: true,
        },
    },
});

router.post("/", postOne);

export default router;
