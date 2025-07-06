import { Router } from "express";
import {
  commentWrite,
  blogWrite,
  replyWrite,
} from "../controller/BlogWrite.js";
import {
  blogBookmark,
  blogUnbookmark,
  blogUpdate,
  blogDelete,
  commentDelete,
} from "../controller/BlogUpdate.js";
import { verifyAccessToken } from "../middleware/verifyAccessToken.js";

const router = Router();

router.post("/blog", verifyAccessToken, blogWrite);
router.post("/blog/delete", verifyAccessToken, blogDelete);
router.post("/draft/publish", verifyAccessToken, blogUpdate);
router.post("/comment", verifyAccessToken, commentWrite);
router.post("/comment/delete", verifyAccessToken, commentDelete);
router.post("/reply", verifyAccessToken, replyWrite);
router.post("/bookmark/remove", verifyAccessToken, blogUnbookmark);
router.post("/bookmark/save", verifyAccessToken, blogBookmark);

export default router;
