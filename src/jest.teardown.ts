import mongoose from "mongoose";
import initApp from "./server";
import { deleteAllImages } from "./utils/uploadUtils";
import dotenv from "dotenv";
import path from "path";

export default async () => {
  const envPath = path.resolve(__dirname, "../.env.test");
  dotenv.config({ path: envPath, override: true });

  await initApp();
  await deleteAllImages();
  await mongoose.connection.close();
};
