import express from "express";
import { authMiddleware } from "../controllers/auth_controller";
import postsController from "../controllers/posts_controller";
const router = express.Router();

router.get("/", postsController.getAll.bind(postsController));

router.get("/:id", postsController.getById.bind(postsController));

router.post("/", authMiddleware, postsController.create.bind(postsController));

router.delete(
  "/:id",
  authMiddleware,
  postsController.deleteItem.bind(postsController)
);

router.put("/:id", postsController.updateItem.bind(postsController));

export default router;
