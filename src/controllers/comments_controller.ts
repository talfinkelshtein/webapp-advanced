import commentsModel, { IComments } from "../models/comments_model";
import BaseController from "./base_controller";
import { Request, Response } from "express";

class CommentsController extends BaseController<IComments> {
    constructor() {
        super(commentsModel);
    }

    getCommentsByPostId = async (req: Request, res: Response) => {
      const postId = req.params.id;
      try {
        const comment = await commentsModel.find({ postId: postId });
        if (comment) {
          res.send(comment);
        } else {
          res.status(404).send("Post not found");
        }
      } catch (error) {
        res.status(400).send(error);
      }
    };
  };

export default new CommentsController();

