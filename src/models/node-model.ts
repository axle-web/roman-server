import { AppError } from "@utils";
import { Model, ObjectId, Schema, Types, model } from "mongoose";

export interface INode<Details extends object = {}> {
  _id: Types.ObjectId;
  name: string;
  branch: ObjectId;
  createdBy: Types.ObjectId;
  details: Details;
  type: string;
}

export interface INodePublic<Details extends {}>
  extends Omit<INode<Details>, "_id" | "branch"> {
  branch: string;
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

type NodeModelMethods = {};
export type INodeModel = Model<INode, {}, NodeModelMethods>;

const nodeSchema = new Schema<INode, INodeModel, NodeModelMethods>(
  {
    name: {
      type: String,
      unique: true,
      required: true,
      minlength: 1,
      maxlength: 128,
    },
    branch: {
      type: Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    details: {
      type: Schema.Types.Mixed,
      default: {},
    },
    type: {
      type: String,
      minlength: 1,
      maxlength: 128,
    },
  },
  {
    timestamps: true,
  }
);

nodeSchema.post("findOneAndDelete", function (doc: INode) {
  if (!doc) throw AppError.createDocumentNotFoundError("node");
  // Remove the image from the associated album
  const Branch = model("Branch");
  if (doc.branch) Branch.findById(doc.branch, { $pull: { nodes: doc._id } });
});

const Node = model<INode, INodeModel>("Node", nodeSchema);

export default Node;
