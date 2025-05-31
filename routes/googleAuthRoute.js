import googleAuthController from "../controller/googleAuthController.js";
import { Router } from "express";

const router = Router();

router.get("/google", async (req, res) => {
  res.status(200).json("Google Auth");
});
router.post("/google", googleAuthController);

export default router;
