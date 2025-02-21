import { AppError, log } from "@utils";
import { Model, ObjectId, Schema, Types, model } from "mongoose";

export interface INode<Details extends object = Record<string, unknown>> {
  slug: string;
  _id: Types.ObjectId;
  name: string;
  branch: ObjectId;
  createdBy: Types.ObjectId;
  details: Details;
  views: number;
  system: boolean;
}

export interface INodePublic<Details extends {}>
  extends Omit<INode<Details>, "_id" | "system"> {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

type NodeModelMethods = {};
export type INodeModel = Model<INode, {}, NodeModelMethods>;

const nodeSchema = new Schema<INode, INodeModel, NodeModelMethods>(
  {
    slug: { type: String, unique: true, slug: "name" },
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
    views: { type: Number, default: 0 },
    system: {
      type: Boolean,
      default: false,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

nodeSchema.pre("save", function (next) {
  if (!this.isNew) return next();
  // Add this node to the branch
  // If the branch does not have a "details" object, create one
  // Then add this node's cover to the branch's "details" object
  if (this.details?.cover)
    model("Branch")
      .findByIdAndUpdate(this.branch, [
        {
          $set: {
            // Use $concatArrays to append this._id to the nodes array
            nodes: { $concatArrays: ["$nodes", [this._id]] },
            // Use $ifNull to keep existing cover or set to this.details.cover
            "details.cover": {
              $ifNull: ["$details.cover", this.details.cover],
            },
          },
        },
      ])
      .then((doc) =>
        log.debug(`node ${this.name} added to branch ${doc.name}`)
      );
  next();
});

nodeSchema.post("findOneAndDelete", function (doc: INode) {
  if (!doc) throw AppError.createDocumentNotFoundError("node");
  // Remove the image from the associated album
  const Branch = model("Branch");
  if (doc.branch) Branch.findById(doc.branch, { $pull: { nodes: doc._id } });
});

const Node = model<INode, INodeModel>("Node", nodeSchema);

export default Node;
