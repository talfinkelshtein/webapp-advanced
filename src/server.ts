import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express, { Express } from "express";
import mongoose from "mongoose";
import path from "path";
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUI from "swagger-ui-express";
import aiRoutes from "./routes/ai_routes";
import authRoutes from "./routes/auth_routes";
import commentsRoute from "./routes/comments_routes";
import plantRoutes from "./routes/plantRoutes";
import postsRoute from "./routes/posts_route";
import usersRoutes from "./routes/usersRoutes";
import { createUploadsFolder } from "./utils/uploadUtils";

let envFile;
switch (process.env.NODE_ENV) {
  case "production":
    envFile = ".env.production";
    break;
  case "test":
    envFile = ".env.test";
    break;
  default:
    envFile = ".env";
}

dotenv.config({ path: path.resolve(__dirname, `../${envFile}`) });

console.log("Environment File Loaded:", envFile);
console.log("Current NODE_ENV:", process.env.NODE_ENV);

createUploadsFolder();
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  "/uploads",
  express.static(path.join(__dirname, `../${process.env.UPLOADS_DIR}`))
);
app.use("/posts", postsRoute);
app.use("/comments", commentsRoute);
app.use("/auth", authRoutes);
app.use("/users", usersRoutes);
app.use("/ai", aiRoutes);
app.use("/plants", plantRoutes);
app.use(express.urlencoded({ extended: true }));

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Web Dev 2025 REST API",
      version: "1.0.0",
      description: "REST server including authentication using JWT",
    },
    servers: [{ url: "http://localhost:3000" }],
  },
  apis: ["./src/routes/*.ts"],
};
const specs = swaggerJsDoc(options);
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));

const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to database"));

const initApp = () => {
  return new Promise<Express>((resolve, reject) => {
    if (!process.env.DB_CONNECT) {
      reject("DB_CONNECT is not defined in .env file");
    } else {
      mongoose
        .connect(process.env.DB_CONNECT)
        .then(() => {
          resolve(app);
        })
        .catch((error) => {
          reject(error);
        });
    }
  });
};

export default initApp;
