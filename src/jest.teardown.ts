import dotenv from "dotenv";
import path from "path";
import { deleteAllImages } from "./utils/uploadUtils";

export default async () => {
  const envPath = path.resolve(__dirname, "../.env.test");
  dotenv.config({ path: envPath, override: true });

  await deleteAllImages();
};
