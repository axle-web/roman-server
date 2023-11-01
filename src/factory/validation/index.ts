import { ControllerFactory } from "@factory/controller-factory";
import {
    IPopoulateMap,
    MethodProperties,
    MethodPropertyFileOptions,
    MethodPropertyOptions,
    PaginationField,
    PopulateField,
    PopulateFieldElement,
    SortField,
} from "@factory/controller-factory/types";
import Parse from "@factory/parse";
import { AppError } from "@utils";
import { catchAsync } from "@utils";
import Multer from "@utils/multer";
import { Request } from "express";
import Joi from "joi";
namespace Validate {
    const validateFiles = (props: {
        [key: string]: MethodPropertyFileOptions;
    }) => {
        const fileProps = Object.entries(props);
        if (
            fileProps.length === 1 ||
            !fileProps[0][1].count ||
            fileProps[0][1].count === 1
        ) {
            const [name, { mimetypes, required, parse, upload, count }] =
                fileProps[0];
            if (count && count > 1) {
              return Multer.uploadMany({
                name,
                mimetypes,
                required,
                parse,
                upload,
                count,
              });
            }
            return Multer.uploadOne({
                name,
                mimetypes,
                required,
                parse,
                upload,
            });
        } else {
            return catchAsync(async (req, res, next) => {
                next();
            });
        }
    };

    const joiValidate = (schemaObj: Joi.PartialSchemaMap, payload: any) => {
        console.log(payload);
        let joiRes = Joi.object(schemaObj).unknown(false).validate(payload);
        if (joiRes.error)
            throw AppError.createError(
                400,
                joiRes.error?.message,
                "JoiValidationError"
            );
    };

    const optionalValidate = async (
        validations: {
            [key: string]: MethodPropertyOptions<"query">["validate"];
        },
        payload: Request["body"]
    ) => {
        for (let [key, validate] of Object.entries(validations)) {
            if (!validate) continue;
            const isValid = await validate(payload[key]);
            if (isValid instanceof Error) throw isValid;
        }
    };

    export const query = (
        props?: MethodProperties<"query">,
        populate?: PopulateField,
        sort?: SortField,
        pagination?: PaginationField
    ) =>
        catchAsync(async (req, res, next) => {
            if ((!props || Object.keys(props).length === 0) && !populate)
                return next();
            const { schemas, validations, populateMap } =
                Parse.queryMethodProps(props || {}, populate, sort, pagination);
            joiValidate(schemas, req.query);
            await optionalValidate(validations, req.query);
            if (populateMap) req["populate"] = populateMap as any;
            next();
        });

    export const body = (props?: MethodProperties<"body">) => {
        if (!props || Object.keys(props).length === 0)
            return [catchAsync((req, res, next) => next())];
        const { files, schemas, validations } = Parse.bodyMethodProps(props);
        const joiAndOptionalVal = catchAsync(async (req, res, next) => {
            joiValidate(schemas, req.body);
            await optionalValidate(validations, req.body);
            next();
        });
        if (!Object.keys(files).length) {
            return [joiAndOptionalVal];
        } else {
            return [validateFiles(files), joiAndOptionalVal];
        }
    };

    export const queryAndBody = (props: {
        query?: MethodProperties<"query">;
        body?: MethodProperties<"body">;
        populate?: PopulateField;
    }) => {
        const queryMiddlewares = query(props.query);
        const bodyMiddlewares = body(props.body);
        return [queryMiddlewares, ...bodyMiddlewares];
    };
}

export default Validate;
