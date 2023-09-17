import { AppError } from "@utils/appError";
import { catchAsync } from "@utils/catchAsync";
import { InferSchemaType, Model } from "mongoose";
import { GetAllMethodProps, GetOneMethodProps, PostMethodProps } from "./types";
import { log } from "@utils/logger";
import Validate from "@factory/validation";

export class ControllerFactory<
    DocumentType extends object = {},
    ModelStatics extends object = {},
    ModelMethods extends object = {}
> {
    Model: Model<DocumentType, ModelStatics, ModelMethods>;
    constructor(Model: Model<DocumentType, ModelStatics, ModelMethods>) {
        this.Model = Model;
    }

    getOne({
        query,
        operation,
        postprocess = (req, res, next, payload) => payload,
        preprocess = (req, res, next, payload) => payload,
        notFoundError,
        key,
    }: GetOneMethodProps<
        typeof this.Model,
        InferSchemaType<typeof this.Model.schema>
    >) {
        const validation = Validate.query(query);
        const exec = catchAsync(async (req, res, next) => {
            let item: any = "OK";
            let queryPayload = req.query;
            if (operation) {
                item = await operation(req, res, next, this.Model);
            } else {
                queryPayload =
                    (await preprocess(req, res, next, queryPayload)) ??
                    queryPayload;
                item = await this.Model.findOne({
                    [key as any]: queryPayload[key as string],
                });
                if (!item)
                    throw AppError.createDocumentNotFoundError(
                        `${notFoundError || this.Model.modelName.toUpperCase()}`
                    );
                item = (await postprocess(req, res, next, item)) ?? item;
            }
            res.status(200).send(item);
        });
        return [validation, exec];
    }

    getAll({
        query,
        operation,
        postprocess = (req, res, next, payload) => payload,
        preprocess = (req, res, next, payload) => payload,
    }: GetAllMethodProps<
        typeof this.Model,
        InferSchemaType<typeof this.Model.schema>
    >) {
        const validation = Validate.query(query);
        const exec = catchAsync(async (req, res, next) => {
            let items: any = [];
            let queryPayload = req.query;
            if (operation) {
                items = await operation(req, res, next, this.Model);
            } else {
                queryPayload =
                    (await preprocess(req, res, next, queryPayload)) ??
                    queryPayload;
                items = await this.Model.find({});
                if (!items)
                    throw AppError.createDocumentNotFoundError(
                        `${this.Model.modelName.toUpperCase()}`
                    );
                items = (await postprocess(req, res, next, items)) ?? items;
            }
            res.status(200).send(items);
        });
        return [validation, exec];
    }

    postOne({
        query,
        body,
        operation,
        postprocess = async (req, res, next, payload) => payload,
        preprocess = async (req, res, next, payload) => payload,
    }: PostMethodProps<
        typeof this.Model,
        InferSchemaType<typeof this.Model.schema>
    >) {
        const validation = Validate.queryAndBody({ query, body });
        const exec = catchAsync(async (req, res, next) => {
            let responsePayload: any = "OK";
            const queryPayload = req.query;
            let bodyPayload = req.body;
            // TODO ADD common validation methods
            if (operation) {
                let result = await operation(req, res, next, this.Model);
                responsePayload = result;
            } else {
                bodyPayload =
                    (await preprocess(req, res, next, bodyPayload)) ??
                    bodyPayload;
                const itemCreated = new this.Model(bodyPayload);
                responsePayload = await itemCreated.save();
                responsePayload =
                    (await postprocess(req, res, next, responsePayload)) ||
                    responsePayload;
                log.success(
                    `New ${this.Model.modelName} created: ${responsePayload._id}`,
                    { task: "post_one" }
                );
            }
            res.status(200).send(responsePayload);
        });
        return [...validation, exec];
    }
}
