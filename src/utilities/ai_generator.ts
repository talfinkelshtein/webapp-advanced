import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

dotenv.config();

export const generateFlowerDescription = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { plantType } = req.query;

  if (!plantType) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: "Plant type is required" });
    return;
  }

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: `Give a detailed description of the flower ${plantType}.`,
          },
        ],
        max_tokens: 100,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.AI_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    res
      .status(StatusCodes.OK)
      .json({ description: response.data.choices[0].message.content });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("OpenAI API Error:", error.response?.data || error.message);
    } else {
      console.error("Unexpected Error:", error);
    }

    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to fetch description" });
  }
};
