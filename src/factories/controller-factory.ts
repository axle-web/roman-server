import { AppError } from "@utils/appError";
import { catchAsync } from "@utils/catchAsync";
import { NextFunction, Request, Response } from "express";
import Joi from "joi";
import { InferSchemaType, Model } from "mongoose";
type DefaultMethodBehaviorProps<DocumentType extends any> = {
    operation?: never;
    /**
     * Used to query the collection
     * @example
     * default => key = "name"
     * findOne({
                name: query.name,
            });
     */
    key: keyof DocumentType;
};
type OverrideMethodBehaviourProps<MongooseModel extends any> = {
    operation: (
        req: Request,
        res: Response,
        next: NextFunction,
        Model: MongooseModel
    ) => any | Promise<any>;
    key?: never;
};

type MethodBehaviour<MoongoseModel extends any, DocumentType extends any> =
    | DefaultMethodBehaviorProps<DocumentType>
    | OverrideMethodBehaviourProps<MoongoseModel>;

type QueryPayload = Request["query"];

interface MethodPropertyOptions {
    schema: Joi.Schema;
}

interface MethodProperties {
    [name: string]: MethodPropertyOptions;
}

type GenericMethodOptions<
    MongooseModel extends any = any,
    DocumentType extends any = any
> = {
    // findByLabel?: string;
    // allowUnkown?: boolean;
    // or?: string[];
    /** Ignore the method's main operation and execute this instead
     *
     * @param {object} query - the request's query
     * @param {object} body - the request's body
     * @param {MongooseModel} Model - the model provided in the controller instantiation
     *
     * @returns {any} - result is sent with status 200
     */
    post?: (
        req: Request,
        res: Response,
        next: NextFunction,
        payload: DocumentType
    ) => any | Promise<any>;
};

type GetMethodProps<MongooseModel extends any, DocumentType extends any> = {
    query?: MethodProperties;
    notFoundError?: string;
} & GenericMethodOptions<MongooseModel, DocumentType> &
    MethodBehaviour<MongooseModel, DocumentType>;

type PostMethodProps<MongooseModel extends any, DocumentType extends any> = {
    query?: MethodProperties;
    body?: MethodProperties;
    operation?: OverrideMethodBehaviourProps<MongooseModel>["operation"];
} & GenericMethodOptions<MongooseModel, DocumentType>;

export class ControllerFactory<
    DocumentType extends object = {},
    ModelStatics extends object = {},
    ModelMethods extends object = {}
> {
    Model: Model<DocumentType, ModelStatics, ModelMethods>;
    constructor(Model: Model<DocumentType, ModelStatics, ModelMethods>) {
        this.Model = Model;
    }
    private _validate(payload: QueryPayload, props?: MethodProperties) {
        if (!props) return;
        const propsParsed = Object.keys(props).reduce(
            (acc: { [key: string]: Joi.Schema }, key) => {
                acc[key] = props[key].schema;
                return acc;
            },
            {}
        );

        const propsToValidate = Joi.object(propsParsed).unknown(false);
        const res = propsToValidate.validate(payload);
        if (res.error)
            throw AppError.createError(
                400,
                res.error?.message,
                "JoiValidationError"
            );
    }

    getOne({
        query,
        operation,
        post = (req, res, next, payload) => payload,
        notFoundError,
        key,
    }: GetMethodProps<
        typeof this.Model,
        InferSchemaType<typeof this.Model.schema>
    >) {
        return catchAsync(async (req, res, next) => {
            let item: any = "OK";
            const queryPayload = req.query;
            this._validate(queryPayload, query);
            if (operation) {
                item = operation(req, res, next, this.Model);
            } else {
                item = await this.Model.findOne({
                    [key as any]: queryPayload[key as string],
                });
                if (!item)
                    throw AppError.createDocumentNotFoundError(
                        `${notFoundError || this.Model.modelName.toUpperCase()}`
                    );
            }
            res.status(200).send(item);
        });
    }

    postOne({
        query,
        body,
        operation,
        post = async (req, res, next, payload) => payload,
    }: PostMethodProps<
        typeof this.Model,
        InferSchemaType<typeof this.Model.schema>
    >) {
        return catchAsync(async (req, res, next) => {
            let responsePayload: any = "OK";
            const queryPayload = req.query;
            const bodyPayload = req.body;
            this._validate(queryPayload, query);
            this._validate(bodyPayload, body);
            if (operation) {
                let result = await operation(req, res, next, this.Model);
                responsePayload = result;
                // if (result) return res.status(200).send(result);
            } else {
                const itemCreated = new this.Model(bodyPayload);
                responsePayload = await itemCreated.save();
            }
            responsePayload =
                (await post(req, res, next, responsePayload)) ||
                responsePayload;
            res.status(200).send(responsePayload);
        });
    }
}
