import { getAllTags, getOneTag, postOneTag } from "@controllers/tag-controller";
import { protect } from "@middlewares";
import { Router } from "express";

const tagRouter: Router = Router();

tagRouter.post("/", protect("editor"), postOneTag);
tagRouter.get("/", getOneTag);
tagRouter.get("/all", getAllTags);
export default tagRouter;
