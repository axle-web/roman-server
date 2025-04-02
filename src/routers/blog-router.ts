import {
  getAllBlogs,
  getOneBlog,
  postOneBlog,
  sampleBlogs,
} from "@controllers/blog-controller";
import { protect } from "@middlewares";
import { Router } from "express";

const router = Router();
router.get("/", getOneBlog);
router.get("/all", getAllBlogs);
router.get("/sample", sampleBlogs);

router.post("/", protect("editor"), postOneBlog);

export default router;
