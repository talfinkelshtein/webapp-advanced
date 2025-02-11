import { Express } from "express";
import mongoose from "mongoose";
import request from "supertest";
import path from "path";
import userModel, { IUser } from "../models/users_model";
import initApp from "../server";

var app: Express;

type User = IUser & { accessToken?: string };
const testUser: User = {
  email: "test@user.com",
  password: "testpassword",
  username: "test",
};

const cleanDb = async () => {
  await userModel.deleteMany();
}

let userId: string;

beforeAll(async () => {
  console.log("beforeAll");
  app = await initApp();
  await cleanDb();

  await request(app).post("/auth/register").send(testUser);

  const res = await request(app).post("/auth/login").send(testUser);
  testUser.accessToken = res.body.accessToken;
  userId = res.body._id;

  expect(testUser.accessToken).toBeDefined();
  expect(userId).toBeDefined();
});

afterAll((done) => {
  console.log("afterAll");
  cleanDb();
  mongoose.connection.close();
  done();
});

describe("User Profile Tests", () => {
  test("Get User Profile", async () => {
    const response = await request(app)
      .get(`/users/${userId}`)
      .set({ Authorization: `Bearer ${testUser.accessToken}` });

    expect(response.statusCode).toBe(200);
    expect(response.body.email).toBe(testUser.email);
    expect(response.body.username).toBe("test");
  });

  test("Update Username", async () => {
    const response = await request(app)
      .put(`/users/${userId}`)
      .set({ Authorization: `Bearer ${testUser.accessToken}` })
      .send({ username: "UpdatedUser" });

    expect(response.statusCode).toBe(200);
    expect(response.body.username).toBe("UpdatedUser");
  });

  test("Update Profile Picture", async () => {
    const response = await request(app)
      .put(`/users/${userId}`)
      .set({ Authorization: `Bearer ${testUser.accessToken}` })
      .attach("image", path.join(__dirname, "./mocks/test-image.jpg"));

    expect(response.statusCode).toBe(200);
    expect(response.body.profilePicture).toMatch(/uploads_test\/.+\.jpg/);
  });

  test("New user should have default username from email prefix", async () => {
    const newUser = {
      email: "newuser@example.com",
      password: "securepassword",
    };

    const registerResponse = await request(app).post("/auth/register").send(newUser);
    expect(registerResponse.statusCode).toBe(201);

    const loginResponse = await request(app).post("/auth/login").send(newUser);
    expect(loginResponse.statusCode).toBe(200);
    const newUserId = loginResponse.body._id;
    expect(newUserId).toBeDefined();

    const userResponse = await request(app)
      .get(`/users/${newUserId}`)
      .set("Authorization", `Bearer ${loginResponse.body.accessToken}`);

    expect(userResponse.statusCode).toBe(200);
    expect(userResponse.body.username).toBe("newuser"); 
  });
});
