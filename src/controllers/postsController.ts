import { Request, Response } from "express";
import postModel, { IPost } from "../models/posts_model";
import BaseController from "./base_controller";
import { StatusCodes } from "http-status-codes";

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
            );
    
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
    
}

export default new PostsController();
