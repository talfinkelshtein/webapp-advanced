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
};

beforeAll(async () => {
  console.log("beforeAll");
  app = await initApp();
  await commentsModel.deleteMany();
  await userModel.deleteMany();
  await request(app).post("/auth/register").send(testUser);
  const res = await request(app).post("/auth/login").send(testUser);
  testUser.token = res.body.accessToken;
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
      .set({ authorization: "bearer " + testUser.token })
      .send({
        content: testComments[0].content,
        postId: testComments[0].postId,
        owner: testUser.email,
      });
    expect(response.statusCode).toBe(201);
    expect(response.body.content).toBe(testComments[0].content);
    expect(response.body.postId).toBe(testComments[0].postId);
    expect(response.body.owner).toBe(testUser.email);
    commentId = response.body._id;
  });

  test("Test get comment by owner", async () => {
    const response = await request(app).get(
      "/comments?owner=" + testComments[0].owner
    );
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].content).toBe(testComments[0].content);
    expect(response.body[0].postId).toBe(testComments[0].postId);
    expect(response.body[0].owner).toBe(testComments[0].owner);
  });

  test("Comments get by id", async () => {
    const response = await request(app).get("/comments/" + commentId);
    expect(response.statusCode).toBe(200);
    expect(response.body.content).toBe(testComments[0].content);
    expect(response.body.postId).toBe(testComments[0].postId);
    expect(response.body.owner).toBe(testComments[0].owner);
  });

  test("Comments get by post id", async () => {
    const response = await request(app).get(
      "/comments/byPost/" + testComments[0].postId
    );
    expect(response.statusCode).toBe(200);
    expect(response.body[0].content).toBe(testComments[0].content);
    expect(response.body[0].postId).toBe(testComments[0].postId);
    expect(response.body[0].owner).toBe(testComments[0].owner);
  });

  test("Comments get by post id (post doesn't exist)", async () => {
    const response = await request(app).get(
      "/comments/byPost/" + "NONEXISTENT"
    );
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(0);
  });

  test("Test Delete Comment", async () => {
    const response = await request(app)
      .delete("/comments/" + commentId)
      .set({ authorization: "bearer " + testUser.token });
    expect(response.statusCode).toBe(200);

    const response2 = await request(app).get("/comments/" + commentId);
    expect(response2.statusCode).toBe(404);
  });

  test("Test Create Comment", async () => {
    const response = await request(app)
      .post("/comments")
      .set({ authorization: "bearer " + testUser.token })
      .send({
        postId: testComments[0].postId,
        content: "Hello",
        owner: "Lior",
      });
    expect(response.statusCode).toBe(201);
  });

  test("Test Create Comment (Fail - Missing Fields)", async () => {
    const response = await request(app)
      .post("/comments")
      .set({ authorization: "bearer " + testUser.token })
      .send({ postId: testComments[0].postId }); // Missing 'Comment' and 'Owner' field
    expect(response.statusCode).toBe(400);
  });
});
