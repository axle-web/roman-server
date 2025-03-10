import {
  deleteOneFolder,
  getAllFolder,
  getAllFoldersUnique,
  getOneFolder,
  getRootFolders,
  postOneFolder,
  sampleFolders,
  passParentTags as passParentTags,
  updateOneFolder,
} from "@controllers/folder-controller";
import { protect } from "@middlewares";
import { Router } from "express";

const router: Router = Router();

router.get("/", getOneFolder);
router.get("/all", getAllFolder);
router.get("/all-unique", getAllFoldersUnique);
router.get("/sample", sampleFolders);
router.get("/root", getRootFolders);

router.get("/pass-tags", passParentTags);

router.post("/", protect("editor"), postOneFolder);
router.put("/", protect("editor"), updateOneFolder);

router.delete("/", protect("editor"), deleteOneFolder);

export default router;
