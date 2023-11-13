import { getCounts } from "@controllers/dashboard-contoller";
import { protect } from "@middlewares";
import { Router } from "express";

const router = Router();

router.get("/", getCounts);

export default router;