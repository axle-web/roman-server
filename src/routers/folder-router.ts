import {
  deleteOneFolder,
  getAllFolder,
  getOneFolder,
  postOneFolder,
  updateOneFolder,
} from "@controllers/folder-controller";
import { protect } from "@middlewares";
import { Router } from "express";

const router = Router();

router.get("/", getOneFolder);
router.post("/", protect("editor"), postOneFolder);
router.get("/all", getAllFolder);
router.delete("/", protect("editor"), deleteOneFolder);
router.put("/", protect("editor"), updateOneFolder);
export default router;
