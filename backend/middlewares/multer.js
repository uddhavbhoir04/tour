import multer from "multer";

const storage = multer.diskStorage({
  destination: "uploads",
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/[^\w.-]+/g, "_")}`),
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) =>
    /^image\/(jpeg|png|webp|gif|avif)$/.test(file.mimetype) ? cb(null, true) : cb(new Error("Only image uploads are allowed")),
});

export default upload;
