import { Express } from "express";
import mongoose from "mongoose";
import request from "supertest";
import commentsModel from "../models/comments_model";
import userModel, { IUser } from "../models/users_model";
import initApp from "../server";
import testComments from "./test_comments.json";

var app: Express;

type User = IUser & { token?: string };
const testUser: User = {
  email: "test@user.com",
  password: "testpassword",
  username: "testUser",
};

beforeAll(async () => {
  console.log("beforeAll");
  app = await initApp();
  await commentsModel.deleteMany();
  await userModel.deleteMany();

  await request(app).post("/auth/register").send(testUser);
  const res = await request(app).post("/auth/login").send({
    email: testUser.email,
    password: testUser.password,
  });

  testUser.token = res.body.accessToken;
  testUser._id = res.body._id;

  expect(testUser.token).toBeDefined();
});

afterAll((done) => {
  console.log("afterAll");
  mongoose.connection.close();
  done();
});

let commentId = "";

describe("Comments Tests", () => {
  test("Comments test get all (empty)", async () => {
    const response = await request(app).get("/comments");
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(0);
  });

  test("Test Create Comment", async () => {
    const response = await request(app)
      .post("/comments")
      .set({ authorization: `Bearer ${testUser.token}` })
      .send({
        content: testComments[0].content,
        postId: testComments[0].postId,
        owner: testUser._id,
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.content).toBe(testComments[0].content);
    expect(response.body.postId).toBe(testComments[0].postId);
    expect(response.body.owner).toBe(testUser._id);

    commentId = response.body._id;
  });

  test("Test get comment by owner", async () => {
    const response = await request(app).get(`/comments?owner=${testUser._id}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].content).toBe(testComments[0].content);
    expect(response.body[0].postId).toBe(testComments[0].postId);
    expect(response.body[0].owner).toBe(testUser._id);
  });

  test("Comments get by id", async () => {
    const response = await request(app).get(`/comments/${commentId}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.content).toBe(testComments[0].content);
    expect(response.body.postId).toBe(testComments[0].postId);
    expect(response.body.owner).toBe(testUser._id);
  });

  test("Comments get by post id", async () => {
    const response = await request(app).get(`/comments/byPost/${testComments[0].postId}`);
    expect(response.statusCode).toBe(200);
    expect(response.body[0].content).toBe(testComments[0].content);
    expect(response.body[0].postId).toBe(testComments[0].postId);
    expect(response.body[0].owner).toBe(testUser._id);
  });

  test("Comments get by post id (post doesn't exist)", async () => {
    const response = await request(app).get("/comments/byPost/NONEXISTENT");
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(0);
  });

  test("Test Delete Comment", async () => {
    const response = await request(app)
      .delete(`/comments/${commentId}`)
      .set({ authorization: `Bearer ${testUser.token}` });

    expect(response.statusCode).toBe(200);

    const response2 = await request(app).get(`/comments/${commentId}`);
    expect(response2.statusCode).toBe(404);
  });

  test("Test Create Comment (Different Owner)", async () => {
    const response = await request(app)
      .post("/comments")
      .set({ authorization: `Bearer ${testUser.token}` })
      .send({
        postId: testComments[0].postId,
        content: "Hello",
        owner: "DifferentUser",
      });

    expect(response.statusCode).toBe(201);
  });

  test("Test Create Comment (Fail - Missing Fields)", async () => {
    const response = await request(app)
      .post("/comments")
      .set({ authorization: `Bearer ${testUser.token}` })
      .send({ postId: testComments[0].postId }); // Missing 'content' and 'owner' field

    expect(response.statusCode).toBe(400);
  });
});
