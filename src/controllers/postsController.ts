import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import postModel, { IPost } from "../models/posts_model";
import BaseController from "./base_controller";

class PostsController extends BaseController<IPost> {
  constructor() {
    super(postModel);
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: "Missing image" });
        return;
      }

      req.body.imagePath = `/uploads/${req.file.filename}`;
      await super.create(req, res);
    } catch (error) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: "Failed to create post" });
    }
  }

  async updateItem(req: Request, res: Response): Promise<void> {
    try {
      const updateData: Partial<IPost> = { ...req.body };

      if (req.file) {
        updateData.imagePath = `/uploads/${req.file.filename}`;
      }

      const updatedPost = await this.model.findByIdAndUpdate(
        req.params.id,
        { $set: updateData },
        { new: true, runValidators: true }
      );

      if (!updatedPost) {
        res.status(StatusCodes.NOT_FOUND).json({ error: "Post not found" });
        return;
      }

      res.status(StatusCodes.OK).json(updatedPost);
    } catch (error) {
      console.error("Update Post Error:", error);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: "Failed to update post" });
    }
  }

  async hasLiked(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { userId } = req.params;

      const post = await this.model.findById(id);
      if (!post) {
        res.status(StatusCodes.NOT_FOUND).json({ error: "Post not found" });
        return;
      }

      const hasLiked = post.likedBy.includes(userId);
      res.status(StatusCodes.OK).json({ hasLiked });
    } catch (error) {
      console.error("Error checking if user liked post:", error);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: "Failed to check like status" });
    }
  }

  async toggleLike(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params; 
      const { userId } = req.params;

      const post = await this.model.findById(id);
      if (!post) {
        res.status(StatusCodes.NOT_FOUND).json({ error: "Post not found" });
        return;
      }

      const alreadyLiked = post.likedBy.includes(userId);

      if (alreadyLiked) {
        post.likedBy = post.likedBy.filter(
          (likedUserId) => likedUserId !== userId
        );
      } else {
        post.likedBy.push(userId);
      }

      await post.save();

      res.status(StatusCodes.OK).json({
        message: alreadyLiked ? "Post unliked" : "Post liked",
        likedBy: post.likedBy,
      });
    } catch (error) {
      console.error("Error toggling like:", error);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: "Failed to toggle like" });
    }
  }
}

export default new PostsController();
