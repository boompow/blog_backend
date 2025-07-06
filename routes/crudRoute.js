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
router.delete("/blog/delete", verifyAccessToken, blogDelete);
router.put("/draft/publish", verifyAccessToken, blogUpdate);
router.post("/comment", verifyAccessToken, commentWrite);
router.delete("/comment/delete", verifyAccessToken, commentDelete);
router.post("/reply", verifyAccessToken, replyWrite);
router.delete("/bookmark/remove", verifyAccessToken, blogUnbookmark);
router.post("/bookmark/save", verifyAccessToken, blogBookmark);

export default router;
