import { Model, ObjectId, Schema, Types, model } from "mongoose";

export type NodePublic = Node<true>;
export type Node<isPublic extends boolean = false> = {
    _id: Types.ObjectId;
    name: string;
    branch: ObjectId;
    createdBy: ObjectId;
} & (isPublic extends true
    ? {
          createdAt: Date;
          updatedAt: Date;
      }
    : {});

type NodeModelMethods = {};
export type NodeModel = Model<Node, {}, NodeModelMethods>;

const nodeSchema = new Schema<Node, NodeModel, NodeModelMethods>(
    {
        name: {
            type: String,
            unique: true,
            required: true,
            minlength: 1,
            maxlength: 128,
        },
        branch: {
            type: Types.ObjectId,
            ref: "Branch",
            required: true,
        },
        createdBy: {
            type: Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const Node = model<Node, NodeModel>("Node", nodeSchema);

export default Node;
