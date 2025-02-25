import { ControllerFactory } from "@factory/controller-factory";
import JoiSchema from "@utils/joi-schemas";
import NodeModel, { INode, INodeModel } from "@models/node-model";
import { Router } from "express";
import { Model, Types } from "mongoose";
import { Upload } from "@utils/upload";

type CustomNode = INode<{ cover: string }>;
const CustomModel = NodeModel as unknown as Model<CustomNode, INodeModel>;
const Controller = new ControllerFactory(CustomModel);

const router: Router = Router();

const getOne = Controller.getOne({
  key: "_id",
  query: {},
});

const postOne = Controller.postOne({
  body: {
    name: {
      schema: JoiSchema.name,
    },
    file: {
      mimetypes: ["IMAGE"],
      // required: true,
      upload: Upload.envDynamicUpload,
      required: true,
      setAs: "details.cover",
    },
    branch: {
      schema: JoiSchema._id,
    },
  },
  preprocess: (req, res, next, item) => ({
    ...item,
    createdBy: new Types.ObjectId(req.session.user!._id),
  }),
});

// const addToDigitalOcean = [multer(['IMAGE']).any(), ((req: Request, res: Response, next: NextFunction) => {
//     for (const file of req.files) {
//         uploadtoSpaces(file).then(({ path }) => {
//             console.log(path)
//         })
//     }
//     res.status(200).send({})
// })]

router.post("/", postOne);
// router.post("/do", addToDigitalOcean)

export default router;
