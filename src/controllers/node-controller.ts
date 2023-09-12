import { ControllerFactory } from "@factories/controller-factory";
import JoiSchema from "@misc/joi-schemas";
import Branch from "@models/branch-model";
import Node from "@models/node-model";
import User from "@models/user-model";
import { AppError } from "@utils";
import Joi from "joi";

const Controller = new ControllerFactory(Node);

export const getOneNode = Controller.getOne({
    key: "_id",
    query: {
        _id: {
            schema: Joi.string().required(),
        },
    },
});

export const postOneNode = Controller.postOne({
    body: {
        name: {
            schema: JoiSchema.name,
        },
        branch: {
            schema: JoiSchema._id.label("branch id"),
            async validate(val) {
                const branch = await Branch.findById(val);
                if (!branch)
                    return AppError.createDocumentNotFoundError("branch");
            },
        },
        createdBy: {
            schema: JoiSchema._id.label("user id"),
            async validate(val) {
                const user = await User.findById(val);
                if (!user) return AppError.createDocumentNotFoundError("user");
            },
        },
    },
    preprocess: (req, res, next, payload) => {
        Object.assign(payload, { createdBy: req.session.user!._id });
    },
});
