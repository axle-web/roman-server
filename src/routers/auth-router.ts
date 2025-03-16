import { logout, login, register } from "@controllers/auth-controller";
import { protect } from "@middlewares";
import { Router } from "express";

const router: Router = Router();
router.post("/login", login);
router.post("/register", register);
router.get("/logout", logout);

router.get("/verify", protect("user"), (req, res, next) =>
  res.status(200).send((req as any).user)
);

export default router;
