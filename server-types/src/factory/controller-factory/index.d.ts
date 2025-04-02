/// <reference types="qs" />
/// <reference types="express" />
import { Document, Model } from "mongoose";
import { GetAllMethodProps, GetOneMethodProps, PostMethodProps, UpdateMethodProps } from "./types";
export declare class ControllerFactory<DocumentType extends object = {}, ModelStatics extends object = {}, ModelMethods extends object = {}> {
    Model: Model<DocumentType, ModelStatics, ModelMethods>;
    documentInstance: Document<unknown, keyof ModelMethods, DocumentType> & ModelMethods & DocumentType;
    constructor(Model: Model<DocumentType, ModelStatics, ModelMethods>);
    getOne<PopulateOptions extends object = {}>({ query, operation, postprocess, preprocess, notFoundError, key, populate, }: GetOneMethodProps<typeof this.Model, typeof this.documentInstance>): ((req: import("express").Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, res: import("express").Response<any, Record<string, any>>, next: import("express").NextFunction) => void)[];
    getAll<PopulateOptions extends object = {}>({ query, operation, postprocess, preprocess, populate, sort, pagination, }: GetAllMethodProps<typeof this.Model, typeof this.documentInstance>): ((req: import("express").Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, res: import("express").Response<any, Record<string, any>>, next: import("express").NextFunction) => void)[];
    postOne({ query, body, operation, postprocess, preprocess, }: PostMethodProps<typeof this.Model, typeof this.documentInstance>): ((req: import("express").Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, res: import("express").Response<any, Record<string, any>>, next: import("express").NextFunction) => void)[];
    updateOne({ query, body, operation, postprocess, preprocess, }: UpdateMethodProps<typeof this.Model, typeof this.documentInstance>): ((req: import("express").Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, res: import("express").Response<any, Record<string, any>>, next: import("express").NextFunction) => void)[];
}
