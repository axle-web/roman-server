import {
  deleteOneImage,
  getAllImage,
  getOneImage,
  postOneImage,
  sampleImages,
  updateOneImage,
} from "@controllers/image-controller";
import { protect } from "@middlewares";
import { Router } from "express";

const router: Router = Router();
router.get("/", getOneImage);
router.get("/all", protect("editor"), getAllImage);
router.get("/sample", sampleImages);

router.post("/", protect("editor"), postOneImage);
router.put("/", protect("editor"), updateOneImage);

router.delete("/", protect("editor"), deleteOneImage);
export default router;
