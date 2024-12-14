import express from "express";
const router = express.Router();
import commentsController from "../controllers/comments_controller.js";

router.get("/", commentsController.getAllComments);

router.get("/:id", commentsController.getCommentById);

router.get("/byPost/:id", commentsController.getCommentByPostId);

router.post("/", commentsController.createComment);

router.put("/:id", commentsController.updateComment);

router.delete("/:id", commentsController.deleteComment);

export default router;