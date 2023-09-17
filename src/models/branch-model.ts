import { Model, ObjectId, Schema, Types, model } from "mongoose";
export type BranchPublic = Branch<true>;
export type Branch<
    isPublic extends boolean = false,
    Details extends {} = {}
> = {
    _id: Types.ObjectId;
    name: string;
    branches: Types.ObjectId[];
    nodes: Types.ObjectId[];
    createdBy: ObjectId;
    details: Details;
} & (isPublic extends true
    ? {
          createdAt: Date;
          updatedAt: Date;
      }
    : {});
type BranchModelMethods = {};
export type BranchModel = Model<Branch, {}, BranchModelMethods>;

const branchSchema = new Schema<Branch, BranchModel, BranchModelMethods>(
    {
        name: {
            type: String,
            unique: true,
            required: true,
            minlength: 1,
            maxlength: 128,
        },
        branches: [{ type: Types.ObjectId, ref: "Branch" }],
        nodes: [{ type: Types.ObjectId, ref: "Node" }],
        createdBy: {
            type: Types.ObjectId,
            ref: "User",
        },
        details: { type: Object },
    },
    { timestamps: true }
);

const Branch = model<Branch, BranchModel>("Branch", branchSchema);

export default Branch;
