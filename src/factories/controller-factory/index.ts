import { AppError } from "@utils/appError";
import { catchAsync } from "@utils/catchAsync";
import Joi, { Schema } from "joi";
import { InferSchemaType, Model } from "mongoose";
import {
    GetMethodProps,
    MethodProperties,
    MethodPropertyOptions,
    PostMethodProps,
    QueryPayload,
} from "./controller-factory";
import { log } from "@utils/logger";

export class ControllerFactory<
    DocumentType extends object = {},
    ModelStatics extends object = {},
    ModelMethods extends object = {}
> {
    Model: Model<DocumentType, ModelStatics, ModelMethods>;
    constructor(Model: Model<DocumentType, ModelStatics, ModelMethods>) {
        this.Model = Model;
    }

    private async _validate(payload: QueryPayload, props?: MethodProperties) {
        if (!props) return;
        const parsedProps = Object.entries(props).reduce(
            (
                acc: {
                    schema: { [key: string]: Schema };
                    validate: {
                        [key: string]: MethodPropertyOptions["validate"];
                    };
                },
                [key]
            ) => {
                acc.schema[key] = props[key].schema;
                if (props[key].validate) {
                    acc.validate[key] = props[key].validate;
                }
                return acc;
            },
            { schema: {}, validate: {} }
        );
        const propsToValidate = Joi.object(parsedProps["schema"]).unknown(
            false
        );
        const res = propsToValidate.validate(payload);
        if (res.error)
            throw AppError.createError(
                400,
                res.error?.message,
                "JoiValidationError"
            );
        for (let key in parsedProps["validate"]) {
            const valid = await props[key].validate!(payload[key]);
            if (valid instanceof Error) throw valid;
        }
    }

    getOne({
        query,
        operation,
        postprocess = (req, res, next, payload) => payload,
        preprocess = (req, res, next, payload) => payload,
        notFoundError,
        key,
    }: GetMethodProps<
        typeof this.Model,
        InferSchemaType<typeof this.Model.schema>
    >) {
        return catchAsync(async (req, res, next) => {
            let item: any = "OK";
            let queryPayload = req.query;
            await this._validate(queryPayload, query);
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
        return catchAsync(async (req, res, next) => {
            let responsePayload: any = "OK";
            const queryPayload = req.query;
            let bodyPayload = req.body;
            await this._validate(queryPayload, query);
            await this._validate(bodyPayload, body);
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
    }
}
