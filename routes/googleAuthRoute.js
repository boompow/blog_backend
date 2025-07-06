import {
  logout,
  googleAuthController,
} from "../controller/googleAuthController.js";
import { Router } from "express";
import { verifyRefreshToken } from "../middleware/verifyRefreshToken.js";
import { verifyAccessToken } from "../middleware/verifyAccessToken.js";

const router = Router();

router.post("/logout", verifyAccessToken, logout);
router.post("/google", googleAuthController);

// refresh the access token
router.post("/refresh", verifyRefreshToken);

export default router;
