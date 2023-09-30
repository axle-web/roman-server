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
import { catchAsync } from "@utils";
import { Request } from "express";
import Joi from "joi";
import { PopulateOptions } from "mongoose";
/**
 * TODO Pagination
 *  -skip
 *  -limit
 *
 * TODO Sorting
 *  -sort
 *
 * *Filtering
 */

type Pagination = {
    skip: number;
    limit: number;
};

type Sort = Record<string, 1 | -1>;
type QueryItem = Request["query"];

/**
 * TODO finish all parsing and assign to "Request" proprties.
 * example: req.populate
 * TODO Move SetAs here as well.
 */

namespace Parse {
    const parsePopulateFromQuery = (
        keys: string | string[],
        populateMap: IPopoulateMap
    ) => {
        if (!keys) return;
        return typeof keys === "string"
            ? populateMap[keys]
            : keys.map((key) => populateMap[key]);
    };

    export const queryModifiers = (pagination?: PaginationField) =>
        catchAsync(async (req, res, next) => {
            const queryPayload = req.query;
            let populateFromQuery = queryPayload.populate as string | string[];
            let sortFromQuery = queryPayload.sort as string;
            let populateVal: any = undefined;
            let sortVal: any = undefined;
            // populate
            if (populateFromQuery) {
                populateVal = parsePopulateFromQuery(
                    populateFromQuery,
                    req["populate"] as unknown as IPopoulateMap
                );
                delete req.query.populate;
            }

            if (queryPayload.sort) {
                // sorting
                if (sortFromQuery.startsWith("-")) {
                    sortVal = { [sortFromQuery.substring(1)]: -1 };
                } else {
                    sortVal = { [sortFromQuery]: 1 };
                }
                delete req.query.sort;
            }

            req["populate"] = populateVal;
            req["sort"] = sortVal;

            // pagination
            req["pagination"] = {
                limit: (queryPayload?.limit as unknown as number) || 20,
                page: (queryPayload?.page as unknown as number) || 1,
            };
            return next();
        });

    export function populateSchema(populate: PopulateField) {
        const mappedPopulate: IPopoulateMap = {};
        const getPopName = (val: PopulateFieldElement): string => {
            if (typeof val === "string") {
                mappedPopulate[val] = { path: val };
                return val;
            }
            mappedPopulate[val.path] = val;
            return val.path;
        };
        const acceptable = Array.isArray(populate)
            ? populate.map((val) => getPopName(val))
            : [getPopName(populate)];
        return {
            schema: Joi.alternatives()
                .try(
                    Joi.array().items(Joi.string().valid(...acceptable)),
                    Joi.string().valid(...acceptable)
                )
                .messages({
                    "any.only": "Unauthorized one or more populate argument",
                }),
            mapped: mappedPopulate,
        };
    }

    export function sortSchema(sort: SortField) {
        const generateSortValVariations = (val: string) => [val, `-${val}`];
        const acceptable = Array.isArray(sort)
            ? sort.flatMap((val) => generateSortValVariations(val))
            : generateSortValVariations(sort);
        return Joi.string()
            .valid(...acceptable)
            .messages({
                "any.only": "Sort argument is unauthorized",
            });
    }

    export const bodyMethodProps = (props: MethodProperties<"body">) =>
        Object.entries(props).reduce(
            (
                acc: {
                    schemas: { [key: string]: Joi.Schema };
                    validations: {
                        [
                            key: string
                        ]: MethodPropertyOptions<"body">["validate"];
                    };
                    files: { [key: string]: MethodPropertyFileOptions };
                },
                [key]
            ) => {
                if (props[key].schema) {
                    acc.schemas[key] = props[key].schema!;
                    if (props[key].validate) {
                        acc.validations[key] = props[key].validate;
                    }
                } else {
                    acc.files[key] = props[key] as MethodPropertyFileOptions;
                    acc.schemas[key] = Joi.any() as Joi.Schema<any>;
                }
                return acc;
            },
            { schemas: {}, validations: {}, files: {} }
        );

    export const queryMethodProps = (
        props: MethodProperties<"query">,
        populate?: PopulateField,
        sort?: SortField,
        pagination?: PaginationField
    ) => {
        let populateMapped;
        if (populate) {
            const { mapped, schema } = populateSchema(populate);
            props = {
                ...props,
                populate: {
                    schema,
                },
            };
            populateMapped = mapped;
        }
        if (sort) {
            props = {
                ...props,
                sort: {
                    schema: sortSchema(sort),
                },
            };
        }
        if (pagination) {
            if (typeof pagination === "boolean") {
                props = {
                    ...props,
                    limit: {
                        schema: Joi.number().min(0).label("limit"),
                    },
                    page: {
                        schema: Joi.number().min(1).label("page"),
                    },
                };
            } else {
                props = {
                    ...props,
                    limit: {
                        schema: pagination.limit
                            ? Joi.number()
                                  .min(1)
                                  .max(pagination.limit)
                                  .label("limit")
                            : Joi.number().min(1).label("limit"),
                    },
                    page: {
                        schema: pagination.page
                            ? Joi.number()
                                  .min(1)
                                  .max(pagination.page)
                                  .label("page")
                            : Joi.number().min(1).label("page"),
                    },
                };
            }
        }
        return Object.entries(props).reduce(
            (
                acc: {
                    schemas: { [key: string]: Joi.Schema };
                    validations: {
                        [
                            key: string
                        ]: MethodPropertyOptions<"body">["validate"];
                    };
                    populateMap?: IPopoulateMap;
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
            { schemas: {}, validations: {}, populateMap: populateMapped }
        );
    };
}

export default Parse;
