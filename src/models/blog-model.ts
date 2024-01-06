import { Model, Schema, Types, model } from "mongoose";
import { IUserPublic } from "./user-model";

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
export type IBlogModel = Model<IBlog, {}, BlogModelMethods>;

const blogSchema = new Schema<IBlog, IBlogModel, BlogModelMethods>(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    cover: {
      type: String,
    },
    content: {
      type: String,
    },
    slug: {
      type: String,
      slug: "title",
      unique: true,
      slugPaddingSize: 4,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Blog = model<IBlog, IBlogModel>("Blog", blogSchema);
export default Blog;
