import { Model, ObjectId, Types } from "mongoose";
export interface INode<Details extends object = {}> {
    _id: Types.ObjectId;
    name: string;
    branch: ObjectId;
    createdBy: Types.ObjectId;
    details: Details;
    type: string;
}
export interface INodePublic<Details extends {}> extends Omit<INode<Details>, "_id"> {
    _id: string;
    createdAt: Date;
    updatedAt: Date;
}
type NodeModelMethods = {};
export type INodeModel = Model<INode, {}, NodeModelMethods>;
declare const Node: INodeModel;
export default Node;
