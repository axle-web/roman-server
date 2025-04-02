import { ControllerFactory } from "@factory/controller-factory";
import Blog from "@models/blog-model";
import JoiSchema from "@utils/joi-schemas";
import { Upload } from "@utils/upload";
import Joi from "joi";

const Controller = new ControllerFactory(Blog);

export const getOneBlog = Controller.getOne({
  key: "slug",
  query: {
    slug: JoiSchema.title,
  },
});

export const getAllBlogs = Controller.getAll({
  pagination: true,
  sort: ["createdAt"],
  populate: ["createdBy"],
  postprocess: async (req, res, next, payload) => {
    const total = await Blog.countDocuments();
    return {
      data: payload,
      total,
    };
  },
});

export const postOneBlog = Controller.postOne({
  body: {
    title: JoiSchema.title,
    content: Joi.string().required(),
    description: Joi.string().required(),
    cover: {
      mimetypes: ["IMAGE"],
      count: 1,
      // required: true,
      upload: Upload.envDynamicUpload,
    },
  },
  preprocess: (req, res, next, payload) => ({
    ...payload,
    createdBy: req.session.user!._id,
  }),
});

export const deleteOneImage = Controller.getOne({
  query: {
    slug: {
      schema: JoiSchema.title,
    },
  },
  operation: async (req, res, next, Model) => {
    await Blog.findOneAndDelete({
      name: req.query["slug"],
    });
  },
});

export const sampleBlogs = Controller.getAll({
  query: {
    size: Joi.number().required(),
  },
  operation: async (req, res, next, model) => {
    const sample = await Blog.aggregate([
      { $sample: { size: req.query.size as any } },
    ]);
    return sample;
  },
});
