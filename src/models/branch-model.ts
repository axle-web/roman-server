import { AppError, log } from "@utils";
import { Model, Schema, Types, isValidObjectId, model } from "mongoose";
export interface IBranch<Details extends {} = {}> {
  _id: Types.ObjectId;
  name: string;
  branch: Types.ObjectId;
  branches: Types.ObjectId[];
  nodes: Types.ObjectId[];
  createdBy: Types.ObjectId;
  details: Details;
  system: boolean;
  views: number;
  path: string;
  slug: string;
}

export interface IBranchPublic<Details extends {} = {}>
  extends Omit<IBranch<Details>, "_id"> {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

type BranchModelMethods = {};
export type BranchModel = Model<IBranch, {}, BranchModelMethods>;

const branchSchema = new Schema<IBranch, BranchModel, BranchModelMethods>(
  {
    slug: { type: String, unique: true, slug: "name" },
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
      select: false,
    },
    details: { type: Object },
    system: {
      type: Boolean,
      default: false,
      select: false,
    },
    views: { type: Number, default: 0 },
    path: { type: String },
  },
  {
    timestamps: true,
    virtuals: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

branchSchema.virtual("branchCount").get(function () {
  return this.branches ? this.branches.length : 0;
});

branchSchema.virtual("nodeCount").get(function () {
  return this.nodes ? this.nodes.length : 0;
});

branchSchema.pre("save", async function (next) {
  if (!this.isNew || !this.branch) return next();
  const doc = await model("Branch").findByIdAndUpdate(this.branch, {
    $push: { branches: this._id },
  });
  log.debug(`branch ${this.name} appended to branch "${doc?.name}"`);
  this.path = `${doc.path || ""}/${doc.name}`;
  next();
});

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
