import { ControllerFactory } from "@factory/controller-factory";
import Tag from "@models/tag-model";
import JoiSchema from "@utils/joi-schemas";

const Controller = new ControllerFactory(Tag);

export const getOneTag = Controller.getOne({
  key: "_id",
  query: {
    _id: JoiSchema._id,
  },
});

export const getAllTags = Controller.getAll({
  pagination: true,
  sort: ["createdAt"],
});

export const postOneTag = Controller.postOne({
  body: {
    name: {
      schema: JoiSchema.name,
    },
  },
});
