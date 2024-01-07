import { ControllerFactory } from "@factory/controller-factory";
import Message from "@models/message-mode";
import JoiSchema from "@utils/joi-schemas";
import Joi from "joi";

const Controller = new ControllerFactory(Message);

export const getOneMessage = Controller.getOne({
  key: "_id",
  query: {
    _id: JoiSchema._id,
  },
});

export const getAllMessages = Controller.getAll({
  pagination: true,
  sort: ["createdAt"],
  populate: ["createdBy"],
  postprocess: async (req, res, next, payload) => {
    const total = await Message.countDocuments();
    return {
      data: payload,
      total,
    };
  },
});

export const postOneMessage = Controller.postOne({
  body: {
    name: {
      schema: JoiSchema.name,
      setAs: "sender.name",
    },
    email: {
      schema: JoiSchema.email,
      setAs: "sender.email",
    },
    content: Joi.string().required().label("Message content"),
    subject: JoiSchema.name.label("Subject"),
  },
});
