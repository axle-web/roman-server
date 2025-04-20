import { Model, Types } from "mongoose";
export interface IBlog {
    _id: Types.ObjectId;
    title: string;
    description: string;
    cover?: string;
    slug: string;
    createdBy: Types.ObjectId;
    content: string;
}
export interface IBlogPublic extends Omit<IBlog, "_id" | "createdBy"> {
    _id: string;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
}
type BlogModelMethods = {};
export type BlogModel = Model<IBlog, {}, BlogModelMethods>;
declare const Blog: BlogModel;
export default Blog;
