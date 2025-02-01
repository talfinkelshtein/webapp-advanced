import { Request, Response } from "express";
import postModel, { IPost } from "../models/posts_model";
import BaseController from "./base_controller";
import { StatusCodes } from "http-status-codes";

class PostsController extends BaseController<IPost> {
    constructor() {
        super(postModel);
    }

    async create(req: Request, res: Response): Promise<void> {
        console.log("fffffffffff");
        console.log(req.body);
        if (!req.file) {
            res.status(StatusCodes.BAD_REQUEST).json({ error: "Missing image" });
            return;
        }

        req.body.imagePath = `/uploads/${req.file.filename}`;
        await super.create(req, res);
    }
}

export default new PostsController();
