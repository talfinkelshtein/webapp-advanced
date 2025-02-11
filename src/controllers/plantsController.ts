import { Request, Response } from "express";
import axios from "axios";
import dotenv from "dotenv";
import { StatusCodes } from "http-status-codes";

dotenv.config();

export const getPlantsFromTrefle = async (req: Request, res: Response): Promise<void> => {
    try {
        const perPage = 20; 
        const maxPages = 5; 
        let page = 1;
        let allFlowers: any[] = [];

        while (page <= maxPages) {
            const response = await axios.get(
                `https://trefle.io/api/v1/plants?token=${process.env.TREFLE_API_KEY}&page=${page}&per_page=${perPage}`
            );

            if (!response.data || !response.data.data.length) {
                break; 
            }

            allFlowers = [...allFlowers, ...response.data.data];
            page++; 
        }

        const formattedFlowers = allFlowers.map((flower) => ({
            id: flower.id,
            name: flower.common_name || "Unknown Flower",
            scientific_name: flower.scientific_name,
            image_url: flower.image_url || null,
        }));

        console.log(formattedFlowers.length);

        res.status(StatusCodes.OK).json(formattedFlowers);
    } catch (error) {
        console.error("Error fetching flowers from Trefle:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Failed to fetch flower data" });
    }
};
