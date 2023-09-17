import { ControllerFactory } from "@factory/controller-factory";
import JoiSchema from "@misc/joi-schemas";
import Branch from "@models/branch-model";
import User from "@models/user-model";
import { AppError } from "@utils";
import Joi from "joi";

const Controller = new ControllerFactory(Branch);

export const getOneBranch = Controller.getOne({
    key: "_id",
    query: {
        _id: {
            schema: JoiSchema._id,
        },
    },
});

export const postOneBranch = Controller.postOne({
    body: {
        name: {
            schema: JoiSchema.name,
        },
        // createdBy: {
        //     schema: JoiSchema._id.label("user id"),
        //     async validate(val) {
        //         const user = await User.findById(val);
        //         if (!user) return AppError.createDocumentNotFoundError("user");
        //     },
        // },
    },
    preprocess: (req, res, next, payload) => {
        return { ...payload, createdBy: req.session.user!._id };
    },
});
