import {
  deleteOneImage,
  getAllImage,
  getOneImage,
  postOneImage,
  updateOneImage,
} from "@controllers/image-controller";
import { protect } from "@middlewares";
import { Router } from "express";

const router = Router();
router.get("/", getOneImage);
router.post("/", protect("editor"), postOneImage);
router.get("/all", protect("editor"), getAllImage);
router.delete("/", protect("editor"), deleteOneImage);
router.put("/", protect("editor"), updateOneImage);

export default router;
