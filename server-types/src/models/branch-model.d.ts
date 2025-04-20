import { Model, Types } from "mongoose";
export interface IBranch<Details extends {} = {}> {
    _id: Types.ObjectId;
    name: string;
    branch: Types.ObjectId;
    branches: Types.ObjectId[];
    nodes: Types.ObjectId[];
    createdBy: Types.ObjectId;
    details: Details;
    type: string;
    slug: string;
}
export interface IBranchPublic<Details extends {} = {}> extends Omit<IBranch<Details>, "_id" | "branch" | "branches" | "nodes"> {
    _id: string;
    createdAt: Date;
    updatedAt: Date;
    branch: string;
    branches: string[];
    nodes: string[];
}
type BranchModelMethods = {};
export type BranchModel = Model<IBranch, {}, BranchModelMethods>;
declare const Branch: BranchModel;
export default Branch;
