import { ControllerFactory } from "@factory/controller-factory";
import JoiSchema from "@misc/joi-schemas";
import Branch from "@models/branch-model";
import Node from "@models/node-model";
import { AppError } from "@utils";
import caches from "src/cache";

const Controller = new ControllerFactory(Node);

export const getOneNode = Controller.getOne({
    key: "_id",
    query: {
        _id: JoiSchema._id
    },
    populate: ["branch"],
});

export const getAllNode = Controller.getAll({
    sort: ["createdAt", "name"],
    populate: [{ path: "branch", select: "_id name" }],
    pagination: true,
});

export const postOneNode = Controller.postOne({
    body: {
        name: {
            schema: JoiSchema.name,
        },
        branch: {
            schema: JoiSchema._id.label("branch id"),
            async validate(val: string) {
                const branch = await Branch.findById(val);
                if (!branch)
                    return AppError.createDocumentNotFoundError("branch");
            },
        },
    },
    preprocess: (req, res, next, payload) => {
        return { ...payload, createdBy: req.session.user!._id };
    },
});