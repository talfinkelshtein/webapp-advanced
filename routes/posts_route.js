import express from "express";
const router = express.Router();
import postsController from "../controllers/posts_controller.js";

router.get("/", postsController.getAllPosts);

router.get("/:id", postsController.getPostById);

router.post("/", postsController.createPost);

router.put("/:id", postsController.updatePost);

router.delete("/:id", postsController.deletePost);

export default router;