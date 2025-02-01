import multer from "multer";

const upload = multer({ dest: "uploads/" });

export const uploadMiddleware = upload.single("image");
