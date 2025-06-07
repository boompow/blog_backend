import googleAuthController from "../controller/googleAuthController.js";
import { Router } from "express";
import { verifyRefreshToken } from "../middleware/verifyRefreshToken.js";

const router = Router();

router.get("/google", async (req, res) => {
  res.status(200).json("Google Auth");
});
router.post("/google", googleAuthController);

// refresh the access token
router.post("/refresh", verifyRefreshToken);

export default router;
