import fs from "fs";
import path from "path";

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

export const deleteAllImages = async (): Promise<void> => {
  const dirPath = path.join(__dirname, `../../${process.env.UPLOADS_DIR}`);
  
  fs.rmSync(dirPath, { recursive: true, force: true });
};
