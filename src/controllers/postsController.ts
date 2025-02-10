import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import postModel, { IPost } from "../models/posts_model";
import { EditAndDeletePayload } from "../types/auth.types";
import { deleteImageFromServer } from "../utils/uploadUtils";
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
      req.body.owner = new mongoose.Types.ObjectId(req.body.owner);

      const createdPost = await postModel.create(req.body);
      const populatedPost = await createdPost.populate(
        "owner",
        "username profilePicture"
      );

      res.status(StatusCodes.CREATED).json(populatedPost);
    } catch (error) {
      console.error("Create Post Error:", error);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: "Failed to create post" });
    }
  }

  async updateItem(req: Request, res: Response): Promise<void> {
    try {
      const updateData: EditAndDeletePayload<IPost> = { ...req.body };

      if (req.file) updateData.imagePath = `/uploads/${req.file.filename}`;

      const post = await this.model.findById(req.params.id);

      if (!post) {
        if (req.file) deleteImageFromServer(`/uploads/${req.file.filename}`);
        res.status(StatusCodes.NOT_FOUND).json({ error: "Post not found" });
        return;
      }

      if (post.owner.toString() !== updateData.userId) {
        if (req.file) deleteImageFromServer(`/uploads/${req.file.filename}`);
        res.status(StatusCodes.UNAUTHORIZED).json({ error: "Unauthorized" });
        return;
      }

      const updatedPost = await this.model.updateOne(
        { _id: req.params.id },
        { $set: updateData },
        { runValidators: true }
      );

      res.status(StatusCodes.OK).json(updatedPost);
    } catch (error) {
      if (req.file) deleteImageFromServer(req.file.filename);

      console.error("Update Post Error:", error);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: "Failed to update post" });
    }
  }

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const filter = req.query.owner ? { owner: req.query.owner } : {};
      const posts = await this.model
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("owner", "username profilePicture");

      res.status(StatusCodes.OK).json(posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(StatusCodes.BAD_REQUEST).json({ error });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const post = await this.model
        .findById(req.params.id)
        .populate("owner", "username profilePicture");
      post
        ? res.status(StatusCodes.OK).json(post)
        : res.status(StatusCodes.NOT_FOUND).send("Not found");
    } catch (error) {
      res.status(StatusCodes.BAD_REQUEST).json({ error });
    }
  }

  async hasLiked(req: Request, res: Response): Promise<void> {
    try {
      const { id, userId } = req.params;
      const post = await this.model.findById(id);
      if (!post) {
        res.status(StatusCodes.NOT_FOUND).json({ error: "Post not found" });
        return;
      }

      const hasLiked = post.likedBy.some(
        (likedUserId) => likedUserId.toString() === userId
      );
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
      const { id, userId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: "Invalid user ID" });
        return;
      }

      const post = await this.model.findById(id);
      if (!post) {
        res.status(StatusCodes.NOT_FOUND).json({ error: "Post not found" });
        return;
      }

      const userObjectId = new mongoose.Types.ObjectId(userId);
      const alreadyLiked = post.likedBy.some(
        (likedUserId) => likedUserId.toString() === userId
      );

      if (alreadyLiked) {
        post.likedBy = post.likedBy.filter(
          (likedUserId) => likedUserId.toString() !== userId
        );
      } else {
        post.likedBy.push(userObjectId);
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

  async deleteItem(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.body;

      const post = await this.model.findById(req.params.id);

      if (!post) {
        res.status(StatusCodes.NOT_FOUND).json({ error: "Item not found" });
        return;
      }

      if (post.owner.toString() !== userId) {
        res.status(StatusCodes.UNAUTHORIZED).json({ error: "Unauthorized" });
        return;
      }

      if (post.imagePath) deleteImageFromServer(post.imagePath);

      const result = await this.model.findByIdAndDelete(req.params.id);

      res.status(StatusCodes.OK).json(result);
    } catch (error) {
      console.error("Error deleting item:", error);
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "Failed to delete item" });
    }
  }
}

export default new PostsController();
