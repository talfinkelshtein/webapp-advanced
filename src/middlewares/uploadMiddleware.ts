import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: `${process.env.UPLOADS_DIR}/`,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || ".jpg"; 
    const uniqueName = `${file.fieldname}-${Date.now()}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

export const uploadMiddleware = upload.single("image");
