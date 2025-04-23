import {
  getAllMessages,
  getOneMessage,
  postOneMessage,
} from "@controllers/message-controller";
import { protect } from "@middlewares";
import { Router } from "express";

const router: Router = Router();

router.get("/", protect("editor"), getOneMessage);
router.get("/all", protect("editor"), getAllMessages);
router.post("/", postOneMessage);
export default router;
