import { getOneNode, postOneNode } from "@controllers/node-controller";
import { protect } from "@middlewares";
import { Router } from "express";

const router = Router();

router.get("/", getOneNode);
router.post("/", protect("editor"), postOneNode);

export default router;
