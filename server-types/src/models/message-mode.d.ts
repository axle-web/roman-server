import { Model, Types } from "mongoose";
export interface IMessage {
    _id: Types.ObjectId;
    content: string;
    subject?: string;
    sender: {
        name: string;
        email: string;
    };
}
export interface IMessagePublic extends Omit<IMessage, "_id"> {
    _id: string;
    createdAt: string;
    updatedAt: string;
}
type MessageModelMethods = {};
export type MessageModel = Model<IMessage & MessageModelMethods>;
declare const Message: MessageModel;
export default Message;
