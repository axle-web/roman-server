import { FileMimesTypes } from "@types";
import { NextFunction, Request, Response } from "express";
import Joi from "joi";
import { Model, PopulateOption, PopulateOptions, QueryOptions } from "mongoose";

/**
 * Represents the available HTTP method types.
 */
export type SortField = string | string[];
export type PaginationField =
  | boolean
  | {
      /**Max page number to request */
      page?: number;
      /**Limit the number of documents requested. This is also used to determine the number of documents per page.
       * Defaults to 20
       */
      limit?: number;
    };
/**
 * Represents a field for population in Mongoose queries.
 */
export type PopulateField =
  | string
  | PopulateOptions
  | (string | PopulateOptions)[];

/**
 * Represents a single element of a population field.
 */
export type PopulateFieldElement = string | PopulateOptions;
export type IPopoulateMap = Record<string, PopulateFieldElement>;

export type SortField = string | string[];

/**
 * Middleware function type for processing HTTP requests and responses.
 */
export type ProcessMiddleware<DocumentType> = (
  req: Request,
  res: Response,
  next: NextFunction,
  payload: DocumentType
) => any | Promise<DocumentType>;

type OperationCallback<MongooseModel extends any> = (
  req: Request,
  res: Response,
  next: NextFunction,
  Model: MongooseModel
) => any | Promise<any>;

/**
 * Represents the default behavior for an HTTP method.
 */
export type MethodDefaultBehavior<
  DocumentType extends any,
  GetOneMethod extends boolean = false
> = {
  operation?: never;
  /**Runs before payload is passed to databaase setter */
  preprocess?: ProcessMiddleware<Request["query"]>;
  postprocess?: ProcessMiddleware<DocumentType>;
} & (GetOneMethod extends true ? { key: keyof DocumentType } : {});

/**
 * Represents the behavior to override the default method behavior.
 */
export type MethodOverrideBehavior<
  MongooseModel extends any,
  GetOneMethod extends boolean = false
> = {
  /**
   * Callback function to override the method's main operation.
   * @param req - The Express request object.
   * @param res - The Express response object.
   * @param next - The Express next function.
   * @param Model - The Mongoose model for the operation.
   */
  operation: OperationCallback<MongooseModel>;
  postprocess?: never;
  preprocess?: never;
} & (GetOneMethod extends true ? { key?: never } : {});

/**
 * Represents the behavior for an HTTP method.
 */
type MethodBehaviour<
  MongooseModel extends any,
  DocumentType extends any,
  GetOneMethod extends boolean
> =
  | MethodDefaultBehavior<DocumentType, GetOneMethod>
  | MethodOverrideBehavior<MongooseModel, GetOneMethod>;

/**
 * Represents options for handling file properties in an HTTP method.
 */
type MethodPropertyFileOptions = {
  /** Cannot use schema when defining a file */
  schema?: never;
  /** Cannot use validate when defining a file */
  validate?: never;
  /**
   * Array of allowed file MIME types.
   */
  mimetypes: Array<FileMimesTypes>;
  /**
   * Maximum number of files allowed.
   */
  count?: number;
  /**
   * Whether the file is required.
   */
  required?: boolean;
  /**
   * Function to parse the uploaded file.
   * @param file - The uploaded Express Multer file.
   * @returns The parsed object, number, or string.
   */
  parse?: (file: Express.Multer.File) => object | number | string;
  /**
   * Function to handle the uploaded file.
   * @param file - The uploaded Express Multer file.
   * @returns A promise or object, number, or string.
   */
  upload?: (
    file: Express.Multer.File
  ) => Promise<object | number | string> | object | number | string;

  /**
   * Wait for the file to be uploaded before parsing.
   */
  async?: boolean;
};

/**
 * Represents options for handling property values in an HTTP method.
 */
type MethodPropertyValueOptions =
  | Joi.Schema
  | {
      /**
       * The schema for validating the property value.
       */
      schema: Joi.Schema;
      /**
       * Function to validate the property value.
       * @param val - The property value.
       * @returns An error or void (no error).
       */
      validate?: (val: any) => Error | void | Promise<void | Error>;
    };

/**
 * Represents options for handling property values in an HTTP method.
 * @template MethodType - The type of the method (e.g., "body" or "query").
 */
type MethodPropertyOptions<MethodType extends "body" | "query"> = {
  /**
   * Set as "example" field in the database.
   */
  setAs?: string;
} & (MethodType extends "query"
  ? MethodPropertyValueOptions
  : MethodPropertyValueOptions | MethodPropertyFileOptions);

/**
 * Represents properties for an HTTP method (e.g., "body" or "query").
 * @template MethodType - The type of the method (e.g., "body" or "query").
 */
interface MethodProperties<MethodType extends "body" | "query" = "query"> {
  /**
   * Key-value pairs of method properties.
   */
  [name: string]: MethodPropertyOptions<MethodType>;
}

/**
 * Represents generic options for an HTTP method.
 * @template MongooseModel - The Mongoose model.
 * @template DocumentType - The document type.
 * @template GetOneMethod - Whether it's a "getOne" method (true/false).
 */
type GenericMethodOptions<
  MongooseModel extends any,
  DocumentType extends any = any,
  GetOneMethod extends boolean = false
> = {} & MethodBehaviour<MongooseModel, DocumentType, GetOneMethod>;

/**
 * Represents options for a "getOne" HTTP method.
 * @template MongooseModel - The Mongoose model.
 * @template DocumentType - The document type.
 */
type GetOneMethodProps<MongooseModel extends any, DocumentType extends any> = {
  /**
   * Query properties for the "getOne" method.
   */
  query: MethodProperties;
  /**
   * Error message for when no document is found.
   */
  notFoundError?: string;
  /**
   * Field(s) to populate in the query result.
   */
  populate?: PopulateField;
  // sort?: SortField;
} & GenericMethodOptions<MongooseModel, DocumentType, true>;

/**
 * Represents options for a "getAll" HTTP method.
 * @template MongooseModel - The Mongoose model.
 * @template DocumentType - The document type.
 */
type GetAllMethodProps<MongooseModel extends any, DocumentType extends any> = {
  /**
   * Query properties for the "getAll" method.
   */
  query?: MethodProperties;
  /**
   * Field(s) to populate in the query result.
   */
  populate?: PopulateField;
  sort?: SortField;
  pagination?: PaginationField;
} & GenericMethodOptions<MongooseModel, DocumentType[]>;

/**
 * Represents options for a "post" HTTP method.
 * @template MongooseModel - The Mongoose model.
 * @template DocumentType - The document type.
 */
type PostMethodProps<MongooseModel extends any, DocumentType extends any> = {
  /**
   * Query properties for the "post" method.
   */
  query?: MethodProperties;
  /**
   * Body properties for the "post" method.
   */
  body?: MethodProperties<"body">;
} & GenericMethodOptions<MongooseModel, DocumentType>;

type UpdateMethodProps<MongooseModel extends any, DocumentType extends any> = {
  query: MethodProperties;
  body: MethodProperties<"body">;
} & GenericMethodOptions<MongooseModel, DocumentType, true>;
