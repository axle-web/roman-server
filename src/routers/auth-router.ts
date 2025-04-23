import { logout, login, register } from "@controllers/auth-controller";
import { Router } from "express";

const router: Router = Router();
router.post("/login", login);
router.post("/register", register);
router.get("/logout", logout);

export default router;
