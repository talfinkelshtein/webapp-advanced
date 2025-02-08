import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import commentsModel, { IComment } from "../models/comments_model";
import BaseController from "./base_controller";

class CommentsController extends BaseController<IComment> {
  constructor() {
    super(commentsModel);
  }

  async getCommentsByPostId(req: Request, res: Response): Promise<void> {
    const postId = req.params.id;

    try {
      const comments = await commentsModel
        .find({ postId })
        .populate("owner", "username profilePicture"); 

      res.status(StatusCodes.OK).json(comments);
    } catch (error) {
      console.error("Get Comments Error:", error);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: "Failed to retrieve comments" });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {

      const newComment = await commentsModel.create(req.body);
      const populatedComment = await newComment.populate("owner", "username profilePicture"); 

      res.status(StatusCodes.CREATED).json(populatedComment);
    } catch (error) {
      console.error("Create Comment Error:", error);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: "Failed to create comment" });
    }
  }
}

export default new CommentsController();
