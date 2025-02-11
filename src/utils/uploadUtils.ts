import fs from "fs";
import path from "path";
import postModel from "../models/posts_model";

export const deleteImageFromServer = async (
  imagePath: string
): Promise<void> => {
  const filePath = path.join(__dirname, "../../", imagePath);
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error("Failed to delete image file:", err);
    }
  });
};

export const deleteImages = async () => {
  try {
    const posts = await postModel.find({ content: "Test Content" });

    posts.forEach((post) => {
      if (post.imagePath) deleteImageFromServer(post.imagePath);
    });
  } catch (error) {
    console.error("Error deleting images:", error);
  }
};
