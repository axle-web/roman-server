import { NextFunction, Request, Response } from "express";

type PreProcessFunction<DocumentType extends any> = (
    req: Request,
    res: Response,
    next: NextFunction,
    payload: DocumentType
) => any | Promise<DocumentType>;
type PostProcessFunction<DocumentType extends any> = (
    req: Request,
    res: Response,
    next: NextFunction,
    payload: DocumentType
) => any | Promise<DocumentType>;

type OperationFunction<MongooseModel extends any> = (
    req: Request,
    res: Response,
    next: NextFunction,
    Model: MongooseModel
) => any | Promise<any>;

type DefaultMethodBehaviorProps<
    DocumentType extends any,
    GetMethod extends boolean = false
> = {
    operation?: never;
    preprocess?: PreProcessFunction<DocumentType>;
    postprocess?: PostProcessFunction<DocumentType>;
} & (GetMethod extends true ? { key: keyof DocumentType } : {});

type OverrideMethodBehaviourProps<
    MongooseModel extends any,
    GetMethod extends boolean = false
> = {
    operation: OperationFunction<MongooseModel>;
    postprocess?: never;
    preprocess?: never;
} & (GetMethod extends true ? { key?: never } : {});

type MethodBehaviour<
    MoongoseModel extends any,
    DocumentType extends any,
    GetMethod extends boolean = false
> =
    | DefaultMethodBehaviorProps<DocumentType, GetMethod>
    | OverrideMethodBehaviourProps<MoongoseModel, GetMethod>;

type QueryPayload = Request["query"];

interface MethodPropertyOptions {
    schema: Joi.Schema;
    validate?: (
        val: any
    ) => boolean | void | Error | Promise<boolean | void | Error>;
}

interface MethodProperties {
    [name: string]: MethodPropertyOptions;
}

type GenericMethodOptions<
    MongooseModel extends any,
    DocumentType extends any = any,
    GetMethod extends boolean = false
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
    // post?: (
    //     req: Request,
    //     res: Response,
    //     next: NextFunction,
    //     payload: DocumentType
    // ) => any | Promise<any>;
} & MethodBehaviour<MongooseModel, DocumentType, GetMethod>;

type GetMethodProps<MongooseModel extends any, DocumentType extends any> = {
    query?: MethodProperties;
    notFoundError?: string;
} & GenericMethodOptions<MongooseModel, DocumentType, true>;

type PostMethodProps<MongooseModel extends any, DocumentType extends any> = {
    query?: MethodProperties;
    body?: MethodProperties;
} & GenericMethodOptions<MongooseModel, DocumentType>;
