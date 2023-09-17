import {
    MethodProperties,
    MethodPropertyOptions,
    MethodPropertyOptionsFile,
} from "@factory/controller-factory/types";
import { AppError } from "@utils";
import { catchAsync } from "@utils/catchAsync";
import Multer from "@utils/multer";
import { File } from "buffer";
import { NextFunction, Request, Response } from "express";
import Joi from "joi";

namespace Validate {
    const validateFiles = (props: {
        [key: string]: MethodPropertyOptionsFile;
    }) => {
        const fileProps = Object.entries(props);
        if (
            fileProps.length === 1 ||
            !fileProps[0][1].count ||
            fileProps[0][1].count === 1
        ) {
            const [name, { mimetypes, required, parse, upload, count }] =
                fileProps[0];
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
    const parseBodyMethodProps = (props: MethodProperties<"body">) =>
        Object.entries(props).reduce(
            (
                acc: {
                    schemas: { [key: string]: Joi.Schema };
                    validations: {
                        [
                            key: string
                        ]: MethodPropertyOptions<"body">["validate"];
                    };
                    files: { [key: string]: MethodPropertyOptionsFile };
                },
                [key]
            ) => {
                if (props[key].schema) {
                    acc.schemas[key] = props[key].schema;
                    if (props[key].validate) {
                        acc.validations[key] = props[key].validate;
                    }
                } else {
                    acc.files[key] = props[key] as MethodPropertyOptionsFile;
                    acc.schemas[key] = Joi.any() as Joi.Schema<any>;
                    // console.log(key, props[key]);
                }
                return acc;
            },
            { schemas: {}, validations: {}, files: {} }
        );
    const parseQueryMethodProps = (props: MethodProperties<"query">) =>
        Object.entries(props).reduce(
            (
                acc: {
                    schemas: { [key: string]: Joi.Schema };
                    validations: {
                        [
                            key: string
                        ]: MethodPropertyOptions<"body">["validate"];
                    };
                },
                [key]
            ) => {
                if (props[key].schema) {
                    acc.schemas[key] = props[key].schema;
                    if (props[key].validate) {
                        acc.validations[key] = props[key].validate;
                    }
                }
                return acc;
            },
            { schemas: {}, validations: {} }
        );
    const joiValidate = (schemaObj: Joi.PartialSchemaMap, payload: any) => {
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

    export const query = (props?: MethodProperties<"query">) =>
        catchAsync(async (req, res, next) => {
            if (!props || Object.keys(props).length === 0) return next();
            const { schemas, validations } = parseQueryMethodProps(props);
            joiValidate(schemas, req.query);
            await optionalValidate(validations, req.query);
            next();
        });

    export const body = (props?: MethodProperties<"body">) => {
        if (!props || Object.keys(props).length === 0)
            return [catchAsync((req, res, next) => next())];
        const { files, schemas, validations } = parseBodyMethodProps(props);
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
    }) => {
        const queryMiddlewares = query(props.query);
        const bodyMiddlewares = body(props.body);
        return [queryMiddlewares, ...bodyMiddlewares];
    };
}

export default Validate;
