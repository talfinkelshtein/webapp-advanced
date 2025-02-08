import { Express } from "express";
import mongoose from "mongoose";
import path from "path";
import request from "supertest";
import postModel from "../models/posts_model";
import userModel, { IUser } from "../models/users_model";
import initApp from "../server";

var app: Express;

type User = IUser & { token?: string };
const testUser: User = {
  email: "test@user.com",
  password: "testpassword",
};

beforeAll(async () => {
  console.log("beforeAll");
  app = await initApp();
  await postModel.deleteMany();
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

let postId = "";
describe("Posts Tests", () => {
  test("Posts test get all", async () => {
    const response = await request(app).get("/posts");
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(0);
  });

  test("Test Create Post", async () => {
    const response = await request(app)
      .post("/posts")
      .set({ authorization: "bearer " + testUser.token })
      .field("title", "Test Post")
      .field("content", "Test Content")
      .field("owner", testUser.email)
      .attach("image", path.join(__dirname, "./mocks/test-image.jpg"));

    expect(response.statusCode).toBe(201);
    expect(response.body.content).toBe("Test Content");
    postId = response.body.id;
  });

  test("Test Update Post", async () => {
    const response = await request(app)
      .put("/posts/" + postId)
      .set({ authorization: "bearer " + testUser.token })
      .send({
        title: "Test Post updated",
      });
    expect(response.statusCode).toBe(200);
    expect(response.body.content).toBe("Test Content");
    postId = response.body.id;
  });

  test("Test get post by owner", async () => {
    const response = await request(app).get("/posts?owner=" + testUser.email);
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].content).toBe("Test Content");
  });

  test("Test get post by id", async () => {
    const response = await request(app).get("/posts/" + postId);
    expect(response.statusCode).toBe(200);
    expect(response.body.content).toBe("Test Content");
  });

  test("Test Create Post 2", async () => {
    const response = await request(app)
      .post("/posts")
      .set({ authorization: "bearer " + testUser.token })
      .field("title", "Test Post 2")
      .field("content", "Test Content 2")
      .field("owner", "TestOwner2")
      .attach("image", path.join(__dirname, "./mocks/test-image.jpg"));

    expect(response.statusCode).toBe(201);
  });

  test("Posts test get all 2", async () => {
    const response = await request(app).get("/posts");
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(2);
  });

  test("Test Create Post fail", async () => {
    const response = await request(app)
      .post("/posts")
      .set({ authorization: "bearer " + testUser.token })
      .send({
        content: "Test Content 2",
      });
    expect(response.statusCode).toBe(400);
  });

  test("Test hasLiked for post", async () => {
    const response = await request(app)
      .get(`/posts/${postId}/hasLiked/${testUser._id}`)
      .set({ authorization: "bearer " + testUser.token });
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ hasLiked: false });
  });

  test("Test toggleLike for post", async () => {
    const likeResponse = await request(app)
      .post(`/posts/${postId}/toggleLike/${testUser._id}`)
      .set({ authorization: "bearer " + testUser.token });
    expect(likeResponse.statusCode).toBe(200);
    expect(likeResponse.body.message).toBe("Post liked");

    const hasLikedResponse = await request(app)
      .get(`/posts/${postId}/hasLiked/${testUser._id}`)
      .set({ authorization: "bearer " + testUser.token });

    expect(hasLikedResponse.statusCode).toBe(200);
    expect(hasLikedResponse.body).toEqual({ hasLiked: true });

    const unlikeResponse = await request(app)
      .post(`/posts/${postId}/toggleLike/${testUser._id}`)
      .set({ authorization: "bearer " + testUser.token });
    expect(unlikeResponse.statusCode).toBe(200);
    expect(unlikeResponse.body.message).toBe("Post unliked");

    const hasLikedAgainResponse = await request(app)
      .get(`/posts/${postId}/hasLiked/${testUser._id}`)
      .set({ authorization: "bearer " + testUser.token });

    expect(hasLikedAgainResponse.statusCode).toBe(200);
    expect(hasLikedAgainResponse.body).toEqual({ hasLiked: false });
  });

  test("Test Delete Post", async () => {
    const response = await request(app)
      .delete("/posts/" + postId)
      .set({ authorization: "bearer " + testUser.token });
    expect(response.statusCode).toBe(200);
    const response2 = await request(app).get("/posts/" + postId);
    expect(response2.statusCode).toBe(404);
  });
});
