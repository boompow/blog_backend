import { Router } from "express";
import {
  deleteProfile,
  updateProfile,
  getProfile,
} from "../controller/ProfileController.js";
import { verifyAccessToken } from "../middleware/verifyAccessToken.js";
const router = Router();

router.delete("/delete", verifyAccessToken, deleteProfile);
router.put("/update", verifyAccessToken, updateProfile);
router.post("/get", verifyAccessToken, getProfile); //you made post request with /get it needs to be corrected

export default router;
