import { FileMimesTypes, FileTypes, UniqueArray } from "@types";
import { File } from "buffer";
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

type MethodPropertyOptionsFile = {
    /**Cannot use schema when defining a file */
    schema?: never;
    /**Cannot use validate when defining a file */
    validate?: never;
    mimetypes: Array<FileMimesTypes>;
    count?: number;
    required?: boolean;
    parse?: (file: Express.Multer.File) => object | number | string;
    upload?: (
        file: Express.Multer.File
    ) => Promise<object | number | string> | object | number | string;
};

type MethodPropertyOptionsValue = {
    schema: Joi.Schema;
    validate?: (val: any) => Error | void | Promise<void | Error>;
};

type MethodPropertyOptions<MethodType extends "body" | "query"> = {
    setAs?: string;
} & (MethodType extends "query"
    ? MethodPropertyOptionsValue
    : MethodPropertyOptionsValue | MethodPropertyOptionsFile);

interface MethodProperties<MethodType extends "body" | "query" = "query"> {
    [name: string]: MethodPropertyOptions<MethodType>;
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
} & MethodBehaviour<MongooseModel, DocumentType, GetMethod>;

type GetOneMethodProps<MongooseModel extends any, DocumentType extends any> = {
    query?: MethodProperties;
    notFoundError?: string;
} & GenericMethodOptions<MongooseModel, DocumentType, true>;

type GetAllMethodProps<MongooseModel extends any, DocumentType extends any> = {
    query?: MethodProperties;
} & GenericMethodOptions<MongooseModel, DocumentType>;

type PostMethodProps<MongooseModel extends any, DocumentType extends any> = {
    query?: MethodProperties;
    body?: MethodProperties<"body">;
} & GenericMethodOptions<MongooseModel, DocumentType>;


