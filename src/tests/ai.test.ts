import axios from "axios";
import express from "express";
import request from "supertest";
import { generateFlowerDescription } from "../controllers/ai_controller";
jest.mock("axios"); 

const app = express();
app.use(express.json());
app.get("/flower-description", generateFlowerDescription);

describe("generateFlowerDescription", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("description for valid plant type", async () => {
    const mockDescription =
      "Roses are beautiful flowers with a wide variety of colors and fragrances.";
    (axios.post as jest.Mock).mockResolvedValue({
      data: {
        choices: [
          {
            message: {
              content: mockDescription,
            },
          },
        ],
      },
    });

    const response = await request(app)
      .get("/flower-description")
      .query({ plantType: "Rose" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ description: mockDescription });
    expect(axios.post).toHaveBeenCalledWith(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: "Give a detailed description of the flower Rose.",
          },
        ],
        max_tokens: 100,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
  });

  test("plant type is missing", async () => {
    const response = await request(app).get("/flower-description");

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "Plant type is required" });
    expect(axios.post).not.toHaveBeenCalled();
  });

  test("OpenAI API request fails", async () => {
    (axios.post as jest.Mock).mockRejectedValue({
      response: {
        data: "API error message",
      },
    });

    const response = await request(app)
      .get("/flower-description")
      .query({ plantType: "Rose" });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: "Failed to fetch description" });
    expect(axios.post).toHaveBeenCalled();
  });

  test("handle unexpected errors", async () => {
    (axios.post as jest.Mock).mockRejectedValue(new Error("Unexpected error"));

    const response = await request(app)
      .get("/flower-description")
      .query({ plantType: "Rose" });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: "Failed to fetch description" });
    expect(axios.post).toHaveBeenCalled();
  });
});
