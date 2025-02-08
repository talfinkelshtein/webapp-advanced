import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import postModel, { IPost } from "../models/posts_model";
import userModel from "../models/users_model"; 
import BaseController from "./base_controller";
import mongoose from "mongoose";

class PostsController extends BaseController<IPost> {
  constructor() {
    super(postModel);
  }

  async create(req: Request, res: Response): Promise<void> {
    console.log("Create Post Request:", req.body);
    try {
      if (!req.file) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: "Missing image" });
        return;
      }

      req.body.imagePath = `/uploads/${req.file.filename}`;
      req.body.owner = new mongoose.Types.ObjectId(req.body.owner); 

      const createdPost = await postModel.create(req.body);
      const populatedPost = await createdPost.populate("owner", "username profilePicture");

      res.status(StatusCodes.CREATED).json(populatedPost);
    } catch (error) {
      console.error("Create Post Error:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Failed to create post" });
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
      ).populate("owner", "username profilePicture");

      if (!updatedPost) {
        res.status(StatusCodes.NOT_FOUND).json({ error: "Post not found" });
        return;
      }

      res.status(StatusCodes.OK).json(updatedPost);
    } catch (error) {
      console.error("Update Post Error:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Failed to update post" });
    }
  }

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const filter = req.query.owner ? { owner: req.query.owner } : {};
      const posts = await this.model.find(filter).populate("owner", "username profilePicture");

      res.status(StatusCodes.OK).json(posts);
    } catch (error) {
      res.status(StatusCodes.BAD_REQUEST).json({ error });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const post = await this.model.findById(req.params.id).populate("owner", "username profilePicture");
      post ? res.status(StatusCodes.OK).json(post) : res.status(StatusCodes.NOT_FOUND).send("Not found");
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

      const hasLiked = post.likedBy.some((likedUserId) => likedUserId.toString() === userId);
      res.status(StatusCodes.OK).json({ hasLiked });
    } catch (error) {
      console.error("Error checking if user liked post:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Failed to check like status" });
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
      const alreadyLiked = post.likedBy.some((likedUserId) => likedUserId.toString() === userId);

      if (alreadyLiked) {
        post.likedBy = post.likedBy.filter((likedUserId) => likedUserId.toString() !== userId);
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
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Failed to toggle like" });
    }
  }
}

export default new PostsController();
