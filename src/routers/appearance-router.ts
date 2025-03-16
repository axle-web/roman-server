import {
  addColorPalette,
  getTheme,
  updateBackground,
  updateSelectedColorScheme,
  updateSelectedPalette,
} from "@controllers/theme-controller";
import { Router } from "express";

const router: Router = Router();
router.post("/color", addColorPalette);
router.put("/color/selected", updateSelectedPalette);
router.put("/color/scheme", updateSelectedColorScheme);
router.put("/color/background", updateBackground);
router.get("/", getTheme);

export default router;
