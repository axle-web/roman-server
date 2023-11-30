import { AppError } from "@utils";
import { Model, Schema, Types, model } from "mongoose";
export interface IBranch<
  Details extends {} = {}
> {
  _id: Types.ObjectId;
  name: string;
  branch: Types.ObjectId;
  branches: Types.ObjectId[];
  nodes: Types.ObjectId[];
  createdBy: Types.ObjectId;
  details: Details;
  type: string;
}

export interface IBranchPublic<Details extends {}> extends IBranch<Details> {
  createdAt: Date;
  updatedAt: Date;
}


type BranchModelMethods = {};
export type BranchModel = Model<IBranch, {}, BranchModelMethods>;

const branchSchema = new Schema<IBranch, BranchModel, BranchModelMethods>(
  {
    name: {
      type: String,
      unique: true,
      required: true,
      minlength: 1,
      maxlength: 128,
    },
    branch: { type: Schema.Types.ObjectId, ref: "Branch" },
    branches: [{ type: Schema.Types.ObjectId, ref: "Branch" }],
    nodes: [{ type: Schema.Types.ObjectId, ref: "Node" }],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    details: { type: Object },
    type: {
      type: String,
      minlength: 1,
      maxlength: 128,
    },
  },
  { timestamps: true }
);

branchSchema.post("findOneAndDelete", function (doc: IBranch<false>) {
  if (!doc) throw AppError.createDocumentNotFoundError("branch");
  // Remove the image from the associated album
  const Node = model("Node");
  const Branch = model("Branch");

  if (doc.branch) Branch.findById(doc.branch, { $pull: { branches: doc._id } });
  // delete all branches
  Branch.deleteMany({ _id: { $in: doc.branches } }).then(() => {
    console.log("deleted all groups in", doc.name);
  });

  Node.deleteMany({ _id: { $in: doc.nodes } }).then(() => {
    console.log("deleted all groups in", doc.name);
  });
});

const Branch = model<IBranch, BranchModel>("Branch", branchSchema);

export default Branch;
