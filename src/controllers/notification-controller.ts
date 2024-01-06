import { ControllerFactory } from "@factory/controller-factory";
import JoiSchema from "@utils/joi-schemas";
import Notification from "@models/notification-model";

const Controller = new ControllerFactory(Notification);

export const getOneNotification = Controller.getOne({
  key: "_id",
  query: {
    _id: {
      schema: JoiSchema._id,
    },
  },
});

export const getAllNode = Controller.getAll({
  sort: ["createdAt"],
  pagination: true,
});
