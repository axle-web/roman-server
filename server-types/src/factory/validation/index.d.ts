/// <reference types="qs" />
import { MethodProperties, PaginationField, PopulateField, SortField } from "@factory/controller-factory/types";
import { Request } from "express";
declare namespace Validate {
    const query: (uuid: string, props?: MethodProperties<"query">, populate?: PopulateField, sort?: SortField, pagination?: PaginationField) => (req: Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, res: import("express").Response<any, Record<string, any>>, next: import("express").NextFunction) => void;
    const body: (uuid: string, props?: MethodProperties<"body">) => ((req: Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, res: import("express").Response<any, Record<string, any>>, next: import("express").NextFunction) => void)[];
    const queryAndBody: (props: {
        uuid: string;
        query?: MethodProperties<"query">;
        body?: MethodProperties<"body">;
        populate?: PopulateField;
    }) => ((req: Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, res: import("express").Response<any, Record<string, any>>, next: import("express").NextFunction) => void)[];
}
export default Validate;
