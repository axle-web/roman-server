import { Model, Schema, Types, model } from "mongoose";

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

const messageSchema = new Schema<IMessage, MessageModel, MessageModelMethods>(
  {
    content: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
    },
    sender: {
      name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
    },
  },
  { timestamps: true }
);

const Message = model<IMessage, MessageModel>("Message", messageSchema);
export default Message;
