
import request from "supertest";
import axios from "axios";
import { Express } from "express";
import { mockFlowers } from "../utils/mockFlowers";
import initApp from "../server";
import mongoose from "mongoose";

var app: Express;

beforeAll(async () => {
  console.log("beforeAll");
  app = await initApp();
});

afterAll((done) => {
  console.log("afterAll");  
  mongoose.connection.close();
  done();
});

describe("Plants Tests", () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("Get all plants - API failure (fallback to mock data)", async () => {
        jest.spyOn(axios, 'get').mockRejectedValue(new Error("API call failed"));
        const response = await request(app).get("/plants")

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(mockFlowers);
    });

    test("Get all plants - Real API success", async () => {
        const response = await request(app).get("/plants")
        jest.setTimeout(30000);
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBeGreaterThan(0);
        expect(response.body[0]).toHaveProperty("name");
        expect(response.body[0].name).toBeDefined();
        expect(response.body).not.toEqual(mockFlowers);
    });
});
