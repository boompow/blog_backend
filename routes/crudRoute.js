import { Router } from "express";
import {
  commentWrite,
  blogWrite,
  replyWrite,
} from "../controller/BlogWrite.js";
import { blogBookmark, blogUnbookmark } from "../controller/BlogUpdate.js";
import { verifyAccessToken } from "../middleware/verifyAccessToken.js";

const router = Router();

router.post("/blog", verifyAccessToken, blogWrite);
router.post("/comment", verifyAccessToken, commentWrite);
router.post("/reply", verifyAccessToken, replyWrite);
router.post("/bookmark/remove", verifyAccessToken, blogUnbookmark);
router.post("/bookmark/save", verifyAccessToken, blogBookmark);

export default router;
