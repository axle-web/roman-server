import { ControllerFactory } from "@factory/controller-factory";
import JoiSchema from "@misc/joi-schemas";
import Node from "@models/node-model";
import { Router } from "express";

const Controller = new ControllerFactory(Node);
const router = Router();

const postOne = Controller.postOne({
    body: {
        name: {
            schema: JoiSchema.name,
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
            required: true,
        },
    },
});

router.post("/", postOne);

export default router;
