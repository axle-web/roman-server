import { PopulateFieldElement } from "@factory/controller-factory/types";
import { IUser } from "@models/user-model";
import { QueryOptions } from "mongoose";

declare module "express" {
  interface Request {
    user?: IUser;
    populate?: PopulateFieldElement | PopulateFieldElement[];
    sort?: QueryOptions["sort"];
    pagination?: { limit: number; page: number };
  }
}
