import { AppError } from "@utils/appError";
import { catchAsync } from "@utils";
import {
  Document,
  FilterQuery,
  InferSchemaType,
  Model,
  PopulateOptions,
} from "mongoose";
import {
  GetAllMethodProps,
  GetOneMethodProps,
  PostMethodProps,
  UpdateMethodProps,
} from "./types";
import { log } from "@utils/logger";
import { applySetAsToPayload } from "./utils";
import Parse from "@factory/parse";
import { randomUUID } from "crypto";
import Validate from "@factory/validation";
import Branch from "@models/branch-model";

export class ControllerFactory<
  DocumentType extends object = {},
  ModelStatics extends object = {},
  ModelMethods extends object = {}
> {
  Model: Model<DocumentType, ModelStatics, ModelMethods>;
  documentInstance: Document<unknown, keyof ModelMethods, DocumentType> &
    ModelMethods &
    DocumentType;
  constructor(Model: Model<DocumentType, ModelStatics, ModelMethods>) {
    this.Model = Model;
  }

  getOne<PopulateOptions extends object = {}>({
    query,
    operation,
    postprocess = (req, res, next, payload) => payload,
    preprocess = (req, res, next, payload) => payload,
    notFoundError,
    key,
    populate,
  }: GetOneMethodProps<typeof this.Model, typeof this.documentInstance>) {
    const uuid = randomUUID();
    const validation = Validate.query(uuid, query, populate, uuid);
    const queryModifiers = Parse.queryModifiers();

    const exec = catchAsync(async (req, res, next) => {
      let item: any = "OK";
      let payload = req.query;
      if (operation) {
        item = await operation(req, res, next, this.Model);
      } else {
        payload = (await preprocess(req, res, next, payload)) ?? payload;
        item = await this.Model.findOne({
          [key as any]: payload[key as string],
        })
          .populate<PopulateOptions>(req["populate"] as any)
          .sort(req["sort"]);
        if (!item)
          throw AppError.createDocumentNotFoundError(
            `${notFoundError || this.Model.modelName.toUpperCase()}`
          );
        item = (await postprocess(req, res, next, item)) ?? item;
      }
      res.status(200).send(item);
    });
    return [validation, queryModifiers, exec];
  }

  getAll<PopulateOptions extends object = {}>({
    query,
    operation,
    postprocess = (req, res, next, payload) => payload,
    preprocess = (req, res, next, payload) => payload,
    populate,
    sort,
    pagination,
  }: GetAllMethodProps<typeof this.Model, typeof this.documentInstance>) {
    const uuid = randomUUID();
    const validation = Validate.query(uuid, query, populate, sort, pagination);
    const queryModifiers = Parse.queryModifiers();

    const exec = catchAsync(async (req, res, next) => {
      let items: any = [];
      let queryPayload = req.query;
      if (operation) {
        items = await operation(req, res, next, this.Model);
      } else {
        queryPayload =
          (await preprocess(req, res, next, queryPayload)) ?? queryPayload;
        items = await this.Model.find(queryPayload as any, {})
          .populate<PopulateOptions>(req["populate"] as any)
          .sort(req["sort"])
          .limit(req["pagination"]!.limit)
          .skip((req["pagination"]!.page - 1) * req["pagination"]!.limit);

        if (!items)
          throw AppError.createDocumentNotFoundError(
            `${this.Model.modelName.toUpperCase()}`
          );
        items = (await postprocess(req, res, next, items)) ?? items;
        const totalCount = await this.Model.countDocuments(queryPayload as any);
        let payload: any = { data: items, total: totalCount };
        if (queryPayload["branch"]) {
          const parentBranch = (await Branch.findById(
            queryPayload["branch"]
          )) as any;
          payload = { ...payload, parentCover: parentBranch?.details?.cover };
        }
        return res.status(200).send(payload);
      }
      res.status(200).send(items);
    });
    return [validation, queryModifiers, exec];
  }

  postOne({
    query,
    body,
    operation,
    postprocess = async (req, res, next, payload) => payload,
    preprocess = async (req, res, next, payload) => payload,
  }: PostMethodProps<typeof this.Model, typeof this.documentInstance>) {
    const uuid = randomUUID();

    const validation = Validate.queryAndBody({ uuid, query, body });
    const exec = catchAsync(async (req, res, next) => {
      let responsePayload: any = "OK";
      const queryPayload = req.query;
      let bodyPayload = req.body;
      // TODO ADD common validation methods
      if (operation) {
        let result = await operation(req, res, next, this.Model);
        responsePayload = result;
      } else {
        bodyPayload =
          (await preprocess(req, res, next, bodyPayload)) ?? bodyPayload;
        bodyPayload = applySetAsToPayload(body, bodyPayload);
        const itemCreated = new this.Model(bodyPayload);
        responsePayload = await itemCreated.save();
        responsePayload =
          (await postprocess(req, res, next, responsePayload)) ??
          responsePayload;
        log.info(`New ${this.Model.modelName} created: ${responsePayload._id}`);
      }
      res.status(200).send(responsePayload);
    });
    return [...validation, exec];
  }

  updateOne({
    query,
    body,
    operation,
    postprocess = async (req, res, next, payload) => payload,
    preprocess = async (req, res, next, payload) => payload,
  }: UpdateMethodProps<typeof this.Model, typeof this.documentInstance>) {
    const uuid = randomUUID();
    const validation = Validate.queryAndBody({ uuid, query, body });
    const exec = catchAsync(async (req, res, next) => {
      let responsePayload: any = "OK";
      const queryPayload = req.query as FilterQuery<DocumentType>;
      let bodyPayload = req.body;
      // TODO ADD common validation methods
      if (operation) {
        let result = await operation(req, res, next, this.Model);
        responsePayload = result;
      } else {
        bodyPayload =
          (await preprocess(req, res, next, bodyPayload)) ?? bodyPayload;
        bodyPayload = applySetAsToPayload(body, bodyPayload);
        responsePayload = await this.Model.findOneAndUpdate(
          queryPayload,
          bodyPayload,
          { new: true }
        );
        // throw error if document doesn't exist
        if (!responsePayload) throw AppError.DocumentNotFoundError;
        responsePayload =
          (await postprocess(req, res, next, responsePayload)) ??
          responsePayload;
        log.info(`New ${this.Model.modelName} created: ${responsePayload._id}`);
      }
      res.status(200).send(responsePayload);
    });
    return [...validation, exec];
  }
}
