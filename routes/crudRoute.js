import { Router } from "express";
import { blogWrite } from "../controller/BlogWrite.js";
import {
  blogBookmark,
  blogUnbookmark,
  publishDraft,
  blogDelete,
  updateBlog,
} from "../controller/BlogUpdate.js";
import { verifyAccessToken } from "../middleware/verifyAccessToken.js";
import {
  commentDelete,
  commentWrite,
  replyWrite,
} from "../controller/CommentCRUD.js";

const router = Router();

// blog
router.post("/blog/create", verifyAccessToken, blogWrite);
router.delete("/blog/delete", verifyAccessToken, blogDelete);
router.put("/blog/update", verifyAccessToken, updateBlog);

// draft
router.put("/draft/publish", verifyAccessToken, publishDraft);

// comment
router.post("/comment/create", verifyAccessToken, commentWrite);
router.delete("/comment/delete", verifyAccessToken, commentDelete);
router.post("/reply/create", verifyAccessToken, replyWrite);

// bookmark
router.delete("/bookmark/delete", verifyAccessToken, blogUnbookmark);
router.post("/bookmark/create", verifyAccessToken, blogBookmark);

export default router;
