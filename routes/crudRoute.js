import { Router } from "express";
import publishBlog from "../controller/BlogWrite.js";

const router = Router();

router.post("/create", publishBlog);

export default router;
