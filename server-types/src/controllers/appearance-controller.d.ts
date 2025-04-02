/// <reference types="qs" />
/// <reference types="express" />
/// <reference types="mongoose/types/aggregate" />
/// <reference types="mongoose/types/callback" />
/// <reference types="mongoose/types/collection" />
/// <reference types="mongoose/types/connection" />
/// <reference types="mongoose/types/cursor" />
/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/error" />
/// <reference types="mongoose/types/expressions" />
/// <reference types="mongoose/types/helpers" />
/// <reference types="mongoose/types/middlewares" />
/// <reference types="mongoose/types/indexes" />
/// <reference types="mongoose/types/models" />
/// <reference types="mongoose/types/mongooseoptions" />
/// <reference types="mongoose/types/pipelinestage" />
/// <reference types="mongoose/types/populate" />
/// <reference types="mongoose/types/query" />
/// <reference types="mongoose/types/schemaoptions" />
/// <reference types="mongoose/types/schematypes" />
/// <reference types="mongoose/types/session" />
/// <reference types="mongoose/types/types" />
/// <reference types="mongoose/types/utility" />
/// <reference types="mongoose/types/validation" />
/// <reference types="mongoose/types/virtuals" />
/// <reference types="mongoose/types/inferschematype" />
import { IBranch, IBranchPublic } from "../models/branch-model";
import { INode, INodePublic } from "../models/node-model";
import { Model } from "mongoose";
export type GenericNodeType = INodePublic<Record<string, any>>;
export declare const GenericNodeModel: Model<GenericNodeType, INode<{}>, {}, {}, import("mongoose").Document<unknown, INode<{}>, GenericNodeType> & GenericNodeType & Required<{
    _id: string;
}>, any>;
export type GenericFolderType = IBranchPublic<Record<string, any>>;
export declare const GenericFolderModel: Model<GenericNodeType, IBranch<{}>, {}, {}, import("mongoose").Document<unknown, IBranch<{}>, GenericNodeType> & GenericNodeType & Required<{
    _id: string;
}>, any>;
export declare const getAppData: (req: import("express").Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, res: import("express").Response<any, Record<string, any>>, next: import("express").NextFunction) => void;
export declare const postOneSlide: ((req: import("express").Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, res: import("express").Response<any, Record<string, any>>, next: import("express").NextFunction) => void)[];
export declare const updateFolderBoxes: ((req: import("express").Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, res: import("express").Response<any, Record<string, any>>, next: import("express").NextFunction) => void)[];
export declare const updateBanner: ((req: import("express").Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, res: import("express").Response<any, Record<string, any>>, next: import("express").NextFunction) => void)[];
export declare const updateFileCarousel: ((req: import("express").Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, res: import("express").Response<any, Record<string, any>>, next: import("express").NextFunction) => void)[];
export declare const updateContactUs: ((req: import("express").Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, res: import("express").Response<any, Record<string, any>>, next: import("express").NextFunction) => void)[];
export declare const updateSocials: ((req: import("express").Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, res: import("express").Response<any, Record<string, any>>, next: import("express").NextFunction) => void)[];
export declare const updateFooter: ((req: import("express").Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, res: import("express").Response<any, Record<string, any>>, next: import("express").NextFunction) => void)[];
