import { Request, Response } from "express";
import axios from "axios";
import dotenv from "dotenv";
import { StatusCodes } from "http-status-codes";
import { mockFlowers } from "../utils/mockFlowers";

dotenv.config();

const formatFlower = (flower: any) => ({
    id: flower.id,
    name: flower.common_name || "Unknown Flower",
    scientificName: flower.scientific_name,
    familyCommonName: flower.family_common_name,
    imageUrl: flower.image_url || null,
});

const fetchFlowersFromTrefle = async (page: number, perPage: number) => {
    const response = await axios.get(
        `https://trefle.io/api/v1/plants?token=${process.env.TREFLE_API_KEY}&page=${page}&per_page=${perPage}`
    );

    return response.data?.data || [];
};

export const getPlantsFromTrefle = async (req: Request, res: Response): Promise<void> => {
    try {
        const perPage = 20;
        const maxPages = 5;
        const allFlowers = await Promise.all(
            Array.from({ length: maxPages }, (_, page) => fetchFlowersFromTrefle(page + 1, perPage))
        );

        const flattenedFlowers = allFlowers.flat();
        const formattedFlowers = flattenedFlowers.map(formatFlower);

        res.status(StatusCodes.OK).json(formattedFlowers);
    } catch (error) {
        console.error("Error fetching flowers from Trefle:", error);
        res.status(StatusCodes.OK).json(mockFlowers);
    }
};
