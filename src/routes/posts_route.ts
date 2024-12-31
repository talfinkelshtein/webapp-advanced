import express from "express";
const router = express.Router();
import postsController from "../controllers/posts_controller";

router.get("/", postsController.getAll.bind(postsController));

router.get("/:id", postsController.getById.bind(postsController));

router.post("/", postsController.create.bind(postsController));

router.delete("/:id", postsController.deleteItem.bind(postsController));

router.put("/:id", postsController.updateItem.bind(postsController));

export default router;