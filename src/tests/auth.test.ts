import { Express } from "express";
import mongoose from "mongoose";
import path from "path";
import request from "supertest";
import * as moduleUnderTest from "../controllers/auth_controller";
import postModel from "../models/posts_model";
import userModel, { IUser } from "../models/users_model";
import initApp from "../server";

var app: Express;

beforeAll(async () => {
  console.log("beforeAll");
  app = await initApp();
  await userModel.deleteMany();
  await postModel.deleteMany();
  jest.setTimeout(30000);
});

afterAll((done) => {
  console.log("afterAll");
  mongoose.connection.close();
  done();
});

const baseUrl = "/auth";

type User = IUser & {
  accessToken?: string;
  refreshToken?: string;
};

const testUser: User = {
  email: "test@user.com",
  password: "testpassword",
  username: "testuser",
};

describe("Auth Tests", () => {
  test("Auth test register", async () => {
    const response = await request(app)
      .post(baseUrl + "/register")
      .send(testUser);
    expect(response.statusCode).toBe(201);
  });

  test("Auth test register fail", async () => {
    const response = await request(app)
      .post(baseUrl + "/register")
      .send(testUser);
    expect(response.statusCode).not.toBe(200);
  });

  test("Auth test register fail", async () => {
    const response = await request(app)
      .post(baseUrl + "/register")
      .send({
        email: "sdsdfsd",
      });
    expect(response.statusCode).not.toBe(200);
    const response2 = await request(app)
      .post(baseUrl + "/register")
      .send({
        email: "",
        password: "sdfsd",
      });
    expect(response2.statusCode).not.toBe(200);
  });

  test("Auth test login fail token generation (Generate token returns null)", async () => {
    const spy = jest
      .spyOn(moduleUnderTest, "generateToken")
      .mockReturnValue(null);

    const response = await request(app)
      .post(baseUrl + "/login")
      .send(testUser);

    expect(response.statusCode).toBe(500);

    spy.mockRestore();
  });

  test("Auth test login", async () => {
    const response = await request(app)
      .post(baseUrl + "/login")
      .send(testUser);
    expect(response.statusCode).toBe(200);
    const accessToken = response.body.accessToken;
    const refreshToken = response.body.refreshToken;
    expect(accessToken).toBeDefined();
    expect(refreshToken).toBeDefined();
    expect(response.body._id).toBeDefined();
    testUser.accessToken = accessToken;
    testUser.refreshToken = refreshToken;
    testUser._id = response.body._id;
  });

  test("Check tokens are not the same", async () => {
    const response = await request(app)
      .post(baseUrl + "/login")
      .send(testUser);
    const accessToken = response.body.accessToken;
    const refreshToken = response.body.refreshToken;

    expect(accessToken).not.toBe(testUser.accessToken);
    expect(refreshToken).not.toBe(testUser.refreshToken);
  });

  test("Auth test login fail", async () => {
    const response = await request(app)
      .post(baseUrl + "/login")
      .send({
        email: testUser.email,
        password: "sdfsd",
      });
    expect(response.statusCode).not.toBe(200);

    const response2 = await request(app)
      .post(baseUrl + "/login")
      .send({
        email: "dsfasd",
        password: "sdfsd",
      });
    expect(response2.statusCode).not.toBe(200);
  });

  test("Auth test me", async () => {
    const response = await request(app).post("/posts").send({
      title: "Test Post",
      content: "Test Content",
      owner: "sdfSd",
    });
    expect(response.statusCode).toBe(401);

    const response2 = await request(app)
      .post("/posts")
      .set("Authorization", `bearer ${testUser.accessToken}`)
      .field("title", "Test Post")
      .field("content", "Test Content")
      .field("owner", testUser._id as string)
      .attach("image", path.join(__dirname, "./mocks/test-image.jpg"));

    expect(response2.statusCode).toBe(201);
  });

  test("Test refresh token fail (bad refresh token sent)", async () => {
    const response = await request(app)
      .post(baseUrl + "/refresh")
      .send();
    expect(response.statusCode).toBe(400);
  });

  test("Test refresh token", async () => {
    const response = await request(app)
      .post(baseUrl + "/refresh")
      .send({
        refreshToken: testUser.refreshToken,
      });
    expect(response.statusCode).toBe(200);
    expect(response.body.accessToken).toBeDefined();
    expect(response.body.refreshToken).toBeDefined();
    testUser.accessToken = response.body.accessToken;
    testUser.refreshToken = response.body.refreshToken;
  });

  test("Double use refresh token", async () => {
    const response = await request(app)
      .post(baseUrl + "/refresh")
      .send({ refreshToken: testUser.refreshToken });

    expect(response.statusCode).toBe(200);
    const newRefreshToken = response.body.refreshToken;

    const response2 = await request(app)
      .post(baseUrl + "/refresh")
      .send({ refreshToken: testUser.refreshToken });

    expect(response2.statusCode).toBe(401);

    const response3 = await request(app)
      .post(baseUrl + "/refresh")
      .send({ refreshToken: newRefreshToken });

    expect(response3.statusCode).toBe(200);
  });

  test("Test logout", async () => {
    const response = await request(app)
      .post(baseUrl + "/login")
      .send(testUser);
    expect(response.statusCode).toBe(200);
    testUser.accessToken = response.body.accessToken;
    testUser.refreshToken = response.body.refreshToken;

    const response2 = await request(app)
      .post(baseUrl + "/logout")
      .send({
        refreshToken: testUser.refreshToken,
      });
    expect(response2.statusCode).toBe(200);

    const response3 = await request(app)
      .post(baseUrl + "/refresh")
      .send({
        refreshToken: testUser.refreshToken,
      });
    expect(response3.statusCode).not.toBe(200);
  });

  jest.setTimeout(30000);

  test("Test timeout token", async () => {
    const loginResponse = await request(app)
      .post(baseUrl + "/login")
      .send(testUser);

    expect(loginResponse.statusCode).toBe(200);
    testUser.accessToken = loginResponse.body.accessToken;
    testUser.refreshToken = loginResponse.body.refreshToken;

    await new Promise((resolve) => setTimeout(resolve, 10000));

    const response2 = await request(app)
      .post("/posts")
      .set("Authorization", `bearer ${testUser.accessToken}`);

    expect(response2.text).toContain("Access Denied");
    expect(response2.statusCode).toBe(401);

    const refreshResponse = await request(app)
      .post(baseUrl + "/refresh")
      .send({ refreshToken: testUser.refreshToken });

    expect(refreshResponse.statusCode).toBe(200);
    testUser.accessToken = refreshResponse.body.accessToken;

    const response4 = await request(app)
      .post("/posts")
      .set("Authorization", `bearer ${testUser.accessToken}`)
      .field("title", "Test Post")
      .field("content", "Test Content")
      .field("owner", "sdfSd")
      .attach("image", path.join(__dirname, "./mocks/test-image.jpg"));

    expect(response4.statusCode).toBe(201);
  });
});
