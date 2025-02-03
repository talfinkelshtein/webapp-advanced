import { StatusCodes } from "http-status-codes";
import commentsModel, { IComment } from "../models/comments_model";
import BaseController from "./base_controller";
import { Request, Response } from "express";

class CommentsController extends BaseController<IComment> {
  constructor() {
    super(commentsModel);
  }

  getCommentsByPostId = async (req: Request, res: Response): Promise<void> => {
    const postId = req.params.id;

    try {
      const comments = await commentsModel.find({ postId });
      res.status(StatusCodes.OK).json(comments); 
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Failed to retrieve comments" }); 
    }
  };
};

export default new CommentsController();

