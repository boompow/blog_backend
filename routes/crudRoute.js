import { Router } from "express";
import {
  commentWrite,
  blogWrite,
  replyWrite,
} from "../controller/BlogWrite.js";
import { verifyAccessToken } from "../middleware/verifyAccessToken.js";

const router = Router();

router.post("/blog", verifyAccessToken, blogWrite);
router.post("/comment", verifyAccessToken, commentWrite);
router.post("/reply", verifyAccessToken, replyWrite);

export default router;
