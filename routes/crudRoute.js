import { Router } from "express";
import publishBlog from "../controller/BlogWrite.js";
import { verifyAccessToken } from "../middleware/verifyAccessToken.js";

const router = Router();

router.post("/create", verifyAccessToken, publishBlog);

export default router;
