import { Router } from "express";
import { commentWrite, publishBlog } from "../controller/BlogWrite.js";
import { verifyAccessToken } from "../middleware/verifyAccessToken.js";

const router = Router();

router.post("/blog", verifyAccessToken, publishBlog);
router.post("/comment", verifyAccessToken, commentWrite);

export default router;
