import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { generateFlowerDescription } from "../controllers/ai_controller";

const router = express.Router();

/**
 * @swagger
 * /flower-description:
 *   get:
 *     summary: Get a flower description
 *     description: Fetches a detailed description of a given flower using AI.
 *     tags:
 *       - AI Generator
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: plantType
 *         schema:
 *           type: string
 *         required: true
 *         description: The name of the flower to get a description for
 *     responses:
 *       200:
 *         description: Successfully retrieved flower description
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 description:
 *                   type: string
 *                   example: "Roses are woody perennial flowering plants known for their beauty and fragrance..."
 *       400:
 *         description: Missing plantType parameter
 *       500:
 *         description: Server error while generating the description
 */
router.get("/flower-description", authMiddleware, generateFlowerDescription);

export default router;
