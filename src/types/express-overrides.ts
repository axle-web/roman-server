import { PopulateFieldElement } from "@factory/controller-factory/types";
import { QueryOptions } from "mongoose";

declare module "express" {
    interface Request {
        populate: PopulateFieldElement | PopulateFieldElement[];
        sort: QueryOptions["sort"];
        pagination: { limit: number; page: number };
    }
}
