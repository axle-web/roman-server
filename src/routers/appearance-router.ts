import {
  getAppData,
  postOneSlide,
  updateBanner as updateInfoBanner,
  updateFooter,
  updateContactUs,
  updateFolderBoxes,
  updateFileCarousel,
  updateSocials,
} from "@controllers/appearance-controller";
import { protect } from "@middlewares";
import { Router } from "express";

const router = Router();
router.get("/", getAppData);

router.post("/swiperslide", protect("editor"), postOneSlide);

router.put("/file_carousel", protect("editor"), updateFileCarousel);
router.put("/folder_boxes", protect("editor"), updateFolderBoxes);
router.put("/info_banner", protect("editor"), updateInfoBanner);
router.put("/footer", protect("editor"), updateFooter);
router.put("/contact_us", protect("editor"), updateContactUs);
router.put("/socials", protect("editor"), updateSocials);

export default router;
