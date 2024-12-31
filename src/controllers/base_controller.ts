import { Request, Response } from "express";
import { Model } from "mongoose";

class BaseController<T> {
    model: Model<T>;
    constructor(model: any) {
        this.model = model;
    }

    getAll = async (req: Request, res: Response) => {
        const filter = req.query.owner;
        try {
            if (filter) {
                const item = await this.model.find({ owner: filter });
                res.send(item);
            } else {
                const items = await this.model.find();
                res.send(items);
            }
        } catch (error) {
            res.status(400).send(error);
        }
    };

    getById = async (req: Request, res: Response) => {
        const id = req.params.id;

        try {
            const item = await this.model.findById(id);
            if (item != null) {
                res.send(item);
            } else {
                res.status(404).send("not found");
            }
        } catch (error) {
            res.status(400).send(error);
        }
    };

    create = async (req: Request, res: Response) => {
        const body = req.body;
        try {
            const item = await this.model.create(body);
            res.status(201).send(item);
        } catch (error) {
            res.status(400).send(error);
        }
    };

    updateItem = async (req: Request, res: Response) => {
        const id = req.params.id;
        const body = req.body;
        try {
          const item = await this.model.findByIdAndUpdate(id, body, {
            new: true,
          });
          res.status(201).send(item);
        } catch (error) {
          res.status(400).send(error);
        }
      };
      

    async deleteItem(req: Request, res: Response) {
        const id = req.params.id;
        try {
            const rs = await this.model.findByIdAndDelete(id);
            res.status(200).send(rs);
        } catch (error) {
            res.status(400).send(error);
        }
    };

}


export default BaseController