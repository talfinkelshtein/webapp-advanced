import express from "express";
const router = express.Router();
import commentsController from "../controllers/comments_controller";

router.get("/", commentsController.getAll.bind(commentsController));

router.get("/:id", commentsController.getById.bind(commentsController));

router.post("/", commentsController.create.bind(commentsController));

router.delete("/:id", commentsController.deleteItem.bind(commentsController));

router.get("/byPost/:id", commentsController.getCommentsByPostId.bind(commentsController));

router.put("/:id", commentsController.updateItem.bind(commentsController));

export default router;