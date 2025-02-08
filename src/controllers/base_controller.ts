import { Request, Response } from "express";
import { Model, PopulateOptions } from "mongoose";
import { StatusCodes } from "http-status-codes";

class BaseController<T> {
    protected model: Model<T>;
    protected populateFields?: PopulateOptions[];

    constructor(model: Model<T>, populateFields?: string | PopulateOptions | (string | PopulateOptions)[]) {
        this.model = model;

        if (typeof populateFields === "string") {
            this.populateFields = [{ path: populateFields }];
        } else if (Array.isArray(populateFields)) {
            this.populateFields = populateFields.map(field =>
                typeof field === "string" ? { path: field } : field
            );
        } else if (populateFields) {
            this.populateFields = [populateFields];
        } else {
            this.populateFields = undefined;
        }
    }

    async getAll(req: Request, res: Response): Promise<void> {
        try {
            const filter = req.query.owner ? { owner: req.query.owner } : {};
            let query = this.model.find(filter);

            if (this.populateFields && this.populateFields.length > 0) {
                this.populateFields.forEach(field => query = query.populate(field));
            }

            const items = await query;
            res.send(items);
        } catch (error) {
            res.status(StatusCodes.BAD_REQUEST).json({ error });
        }
    }

    async getById(req: Request, res: Response): Promise<void> {
        try {
            let query = this.model.findById(req.params.id);

            if (this.populateFields && this.populateFields.length > 0) {
                this.populateFields.forEach(field => query = query.populate(field));
            }

            const item = await query;
            item ? res.send(item) : res.status(StatusCodes.NOT_FOUND).send("Not found");
        } catch (error) {
            res.status(StatusCodes.BAD_REQUEST).json({ error });
        }
    }

    async create(req: Request, res: Response): Promise<void> {
        try {
            const item = await this.model.create(req.body);
            const populatedItem = this.populateFields && this.populateFields.length > 0
                ? await this.model.findById(item._id).populate(this.populateFields)
                : item;

            res.status(StatusCodes.CREATED).send(populatedItem);
        } catch (error) {
            res.status(StatusCodes.BAD_REQUEST).json({ error });
        }
    }

    async updateItem(req: Request, res: Response): Promise<void> {
        try {
            let query = this.model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
            if (this.populateFields && this.populateFields.length > 0) {
                this.populateFields.forEach(field => query = query.populate(field));
            }

            const item = await query;
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
