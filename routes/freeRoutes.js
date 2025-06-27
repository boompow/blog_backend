import { Router } from "express";
import { blogRead } from "../controller/BlogRead.js";

const router = Router();

router.get("/blogs", blogRead);

export default router;
