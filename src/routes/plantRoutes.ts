import express from "express";
import { getPlantsFromTrefle } from "../controllers/plantsController";

const router = express.Router();

router.get("/", getPlantsFromTrefle);

export default router;
