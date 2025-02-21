import { getCounts } from "@controllers/dashboard-contoller";
import { protect } from "@middlewares";
import { Router } from "express";

const router: Router = Router();

router.get("/", protect("moderator"), getCounts);

export default router;
