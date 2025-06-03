import { Router } from "express";
import {
  deleteProfile,
  updateProfile,
  getProfile,
} from "../controller/ProfileController.js";
const router = Router();

router.delete("/delete", deleteProfile);
router.patch("/update", updateProfile);
router.post("/get", getProfile); //you made post request with /get it needs to be corrected

export default router;
