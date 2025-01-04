import request from "supertest";
import initApp from "../server";
import mongoose from "mongoose";
import commentsModel from "../models/comments_model";
import { Express } from "express";
import testComments from "./test_comments.json";
import userModel, { IUser } from "../models/users_model";

var app: Express;

type User = IUser & { token?: string };
const testUser: User = {
  email: "test@user.com",
  password: "testpassword",
}

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
      .set({ authorization: "JWT " + testUser.token })
      .send({
        comment: testComments[0].comment,
        postId: testComments[0].postId,
        owner: testUser.email,
      });
    expect(response.statusCode).toBe(201);
    expect(response.body.comment).toBe(testComments[0].comment);
    expect(response.body.postId).toBe(testComments[0].postId);
    expect(response.body.owner).toBe(testUser.email);
    commentId = response.body._id;
  });

  test("Test get commenty by owner", async () => {
    const response = await request(app).get("/comments?owner=" + testComments[0].owner);
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].comment).toBe(testComments[0].comment);
    expect(response.body[0].postId).toBe(testComments[0].postId);
    expect(response.body[0].owner).toBe(testComments[0].owner);
  });

  test("Comments get post by id", async () => {
    const response = await request(app).get("/comments/" + commentId);
    expect(response.statusCode).toBe(200);
    expect(response.body.comment).toBe(testComments[0].comment);
    expect(response.body.postId).toBe(testComments[0].postId);
    expect(response.body.owner).toBe(testComments[0].owner);
  });

  test("Test Delete Comment", async () => {
    const response = await request(app)
      .delete("/comments/" + commentId)
      .set({ authorization: "JWT " + testUser.token });
    expect(response.statusCode).toBe(200);

    const response2 = await request(app).get("/comments/" + commentId);
    expect(response2.statusCode).toBe(404);
  });

  test("Test Create Comment (Fail - Missing Fields)", async () => {
    const response = await request(app)
      .post("/comments")
      .set({ authorization: "JWT " + testUser.token })
      .send({ postId: testComments[0].postId }); // Missing 'comment' field
    expect(response.statusCode).toBe(400);
  });

  // test("Test Create Post 2", async () => {
  //   const response = await request(app).post("/posts").send({
  //     title: "Test Post 2",
  //     content: "Test Content 2",
  //     owner: "TestOwner2",
  //   });
  //   expect(response.statusCode).toBe(201);
  // });

  // test("Posts test get all 2", async () => {
  //   const response = await request(app).get("/posts");
  //   expect(response.statusCode).toBe(200);
  //   expect(response.body.length).toBe(2);
  // });

  // test("Test Delete Post", async () => {
  //   const response = await request(app).delete("/posts/" + postId);
  //   expect(response.statusCode).toBe(200);
  //   const response2 = await request(app).get("/posts/" + postId);
  //   expect(response2.statusCode).toBe(404);
  // });

  // test("Test Create Post fail", async () => {
  //   const response = await request(app).post("/posts").send({
  //     title: "Test Post 2",
  //     content: "Test Content 2",
  //   });
  //   expect(response.statusCode).toBe(400);
  // });
});