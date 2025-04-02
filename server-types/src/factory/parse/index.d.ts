/// <reference types="qs" />
import { IPopoulateMap, MethodProperties, MethodPropertyFileOptions, MethodPropertyOptions, PaginationField, PopulateField, SortField } from "@factory/controller-factory/types";
import { Request } from "express";
import Joi from "joi";
/**
 * TODO finish all parsing and assign to "Request" proprties.
 * example: req.populate
 * TODO Move SetAs here as well.
 */
declare namespace Parse {
    const queryModifiers: (pagination?: PaginationField) => (req: Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, res: import("express").Response<any, Record<string, any>>, next: import("express").NextFunction) => void;
    function populateSchema(populate: PopulateField): {
        schema: Joi.AlternativesSchema<any>;
        mapped: IPopoulateMap;
    };
    function sortSchema(sort: SortField): Joi.StringSchema<string>;
    const bodyMethodProps: (props: MethodProperties<"body">) => {
        schemas: {
            [key: string]: Joi.Schema<any>;
        };
        validations: {
            [key: string]: ((value: any, options?: Joi.ValidationOptions | undefined) => Joi.ValidationResult<any>) | ((val: any) => void | Error | Promise<void | Error>) | undefined;
        };
        files: {
            [key: string]: MethodPropertyFileOptions;
        };
    };
    const queryMethodProps: (props: MethodProperties<"query">, populate?: PopulateField, sort?: SortField, pagination?: PaginationField) => {
        schemas: {
            [key: string]: Joi.Schema<any>;
        };
        validations: {
            [key: string]: ((value: any, options?: Joi.ValidationOptions | undefined) => Joi.ValidationResult<any>) | ((val: any) => void | Error | Promise<void | Error>) | undefined;
        };
        populateMap?: IPopoulateMap | undefined;
    };
}
export default Parse;
