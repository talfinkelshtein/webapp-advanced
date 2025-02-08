import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import commentsModel, { IComment } from "../models/comments_model";
import BaseController from "./base_controller";

class CommentsController extends BaseController<IComment> {
  constructor() {
    super(commentsModel, "owner");
  }

  async getCommentsByPostId(req: Request, res: Response): Promise<void> {
    try {
      const comments = await this.model.find({ postId: req.params.id }).populate("owner", "username profilePicture");
      res.status(StatusCodes.OK).json(comments);
    } catch (error) {
      console.error("Get Comments Error:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Failed to retrieve comments" });
    }
  }
}

export default new CommentsController();
