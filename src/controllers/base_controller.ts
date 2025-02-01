import { Request, Response } from "express";
import { Model } from "mongoose";
import { StatusCodes } from "http-status-codes";

class BaseController<T> {
    protected model: Model<T>;

    constructor(model: Model<T>) {
        this.model = model;
    }

    async getAll(req: Request, res: Response): Promise<void> {
        try {
            const filter = req.query.owner ? { owner: req.query.owner } : {};
            const items = await this.model.find(filter);
            res.send(items);
        } catch (error) {
            res.status(StatusCodes.BAD_REQUEST).json({ error });
        }
    }

    async getById(req: Request, res: Response): Promise<void> {
        try {
            const item = await this.model.findById(req.params.id);
            item ? res.send(item) : res.status(StatusCodes.NOT_FOUND).send("Not found");
        } catch (error) {
            res.status(StatusCodes.BAD_REQUEST).json({ error });
        }
    }

    async create(req: Request, res: Response): Promise<void> {
        try {
            const item = await this.model.create(req.body);
            res.status(StatusCodes.CREATED).send(item);
        } catch (error) {
            res.status(StatusCodes.BAD_REQUEST).json({ error });
        }
    }

    async updateItem(req: Request, res: Response): Promise<void> {
        try {
            const item = await this.model.findByIdAndUpdate(req.params.id, req.body, { new: true });
            item ? res.status(StatusCodes.OK).send(item) : res.status(StatusCodes.NOT_FOUND).send("Not found");
        } catch (error) {
            res.status(StatusCodes.BAD_REQUEST).json({ error });
        }
    }

    async deleteItem(req: Request, res: Response): Promise<void> {
        try {
            const result = await this.model.findByIdAndDelete(req.params.id);
            result ? res.status(StatusCodes.OK).send(result) : res.status(StatusCodes.NOT_FOUND).send("Not found");
        } catch (error) {
            res.status(StatusCodes.BAD_REQUEST).json({ error });
        }
    }
}

export default BaseController;
