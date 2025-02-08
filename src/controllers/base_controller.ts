import { Request, Response } from "express";
import { Model, PopulateOptions } from "mongoose";
import { StatusCodes } from "http-status-codes";

class BaseController<T> {
    protected model: Model<T>;
    protected populateFields?: PopulateOptions[];

    constructor(model: Model<T>, populateFields?: string | PopulateOptions | (string | PopulateOptions)[]) {
        this.model = model;
        this.populateFields = this.normalizePopulateFields(populateFields);
    }

    private normalizePopulateFields(populateFields?: string | PopulateOptions | (string | PopulateOptions)[]): PopulateOptions[] | undefined {
        if (!populateFields) return undefined;
        if (typeof populateFields === "string") return [{ path: populateFields }];
        if (Array.isArray(populateFields)) {
            return populateFields.map(field => (typeof field === "string" ? { path: field } : field));
        }
        return [populateFields];
    }

    async getAll(req: Request, res: Response): Promise<void> {
        try {
            const filter = req.query.owner ? { owner: req.query.owner } : {};
            let query = this.model.find(filter);
            if (this.populateFields) this.populateFields.forEach(field => query = query.populate(field));

            const items = await query;
            res.status(StatusCodes.OK).json(items);
        } catch (error) {
            console.error("Error fetching all items:", error);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Failed to fetch items" });
        }
    }

    async getById(req: Request, res: Response): Promise<void> {
        try {
            let query = this.model.findById(req.params.id);
            if (this.populateFields) this.populateFields.forEach(field => query = query.populate(field));

            const item = await query;
            item ? res.status(StatusCodes.OK).json(item) : res.status(StatusCodes.NOT_FOUND).json({ error: "Item not found" });
        } catch (error) {
            console.error("Error fetching item by ID:", error);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Failed to fetch item" });
        }
    }

    async create(req: Request, res: Response): Promise<void> {
        try {
            const item = await this.model.create(req.body);
            const populatedItem = this.populateFields ? await this.model.findById(item._id).populate(this.populateFields) : item;
            res.status(StatusCodes.CREATED).json(populatedItem);
        } catch (error) {
            console.error("Error creating item:", error);
            res.status(StatusCodes.BAD_REQUEST).json({ error: "Failed to create item" });
        }
    }

    async updateItem(req: Request, res: Response): Promise<void> {
        try {
            let query = this.model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
            if (this.populateFields) this.populateFields.forEach(field => query = query.populate(field));

            const item = await query;
            item ? res.status(StatusCodes.OK).json(item) : res.status(StatusCodes.NOT_FOUND).json({ error: "Item not found" });
        } catch (error) {
            console.error("Error updating item:", error);
            res.status(StatusCodes.BAD_REQUEST).json({ error: "Failed to update item" });
        }
    }

    async deleteItem(req: Request, res: Response): Promise<void> {
        try {
            const result = await this.model.findByIdAndDelete(req.params.id);
            result ? res.status(StatusCodes.OK).json(result) : res.status(StatusCodes.NOT_FOUND).json({ error: "Item not found" });
        } catch (error) {
            console.error("Error deleting item:", error);
            res.status(StatusCodes.BAD_REQUEST).json({ error: "Failed to delete item" });
        }
    }
}

export default BaseController;
