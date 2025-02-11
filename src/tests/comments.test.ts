import { Express } from "express";
import mongoose from "mongoose";
import path from "path";
import request from "supertest";
import commentsModel from "../models/comments_model";
import postModel from "../models/posts_model";
import userModel, { IUser } from "../models/users_model";
import initApp from "../server";
import testComments from "./mocks/test_comments.json";

var app: Express;

type User = IUser & { token?: string };
const testUser: User = {
  email: "test@user.com",
  password: "testpassword",
  username: "test",
};

const cleanDb = async () => {
  await commentsModel.deleteMany();
  await userModel.deleteMany();
  await postModel.deleteMany();
};

let postId = "";
let userId = "";

beforeAll(async () => {
  console.log("beforeAll");
  app = await initApp();
  await cleanDb();

  await request(app).post("/auth/register").send(testUser);
  const res = await request(app).post("/auth/login").send({
    email: testUser.email,
    password: testUser.password,
  });

  testUser.token = res.body.accessToken;
  testUser._id = res.body._id;
  userId = testUser._id as string;

  expect(testUser.token).toBeDefined();

  const postResponse = await request(app)
    .post("/posts")
    .set({ authorization: `Bearer ${testUser.token}` })
    .field("content", "Test Content")
    .field("plantType", "Daisy")
    .field("owner", userId)
    .attach("image", path.join(__dirname, "./mocks/test-image.jpg"));

  expect(postResponse.statusCode).toBe(201);
  postId = postResponse.body.id;

  testComments.forEach((comment) => {
    comment.postId = postId;
    comment.owner = userId;
  });
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
        owner: testComments[0].owner,
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.content).toBe(testComments[0].content);
    expect(response.body.postId).toBe(testComments[0].postId);
    expect(response.body.owner).toMatchObject({
      _id: testUser._id,
      username: testUser.username,
    });

    commentId = response.body.id;
  });

  test("Test get comment by owner", async () => {
    const response = await request(app).get(`/comments?owner=${testUser._id}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].content).toBe(testComments[0].content);
    expect(response.body[0].postId).toBe(postId);

    expect(response.body[0].owner).toMatchObject({
      _id: testUser._id,
      username: testUser.username,
    });
  });

  test("Comments get by post id", async () => {
    const response = await request(app).get(`/comments/byPost/${postId}`);
    expect(response.statusCode).toBe(200);
    expect(response.body[0].content).toBe("This is a test comment");
    expect(response.body[0].postId).toBe(postId);
    expect(response.body[0].owner).toMatchObject({
      _id: userId,
      username: testUser.username,
    });
  });

  test("Comments get by post id (post doesn't exist)", async () => {
    const nonExistentPostId = new mongoose.Types.ObjectId().toString();
    const response = await request(app).get(
      "/comments/byPost/" + nonExistentPostId
    );
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

  test("Test Create Comment (Fail - Missing Fields)", async () => {
    const response = await request(app)
      .post("/comments")
      .set({ authorization: `Bearer ${testUser.token}` })
      .send({ postId: postId });

    expect(response.statusCode).toBe(400);
  });
});
