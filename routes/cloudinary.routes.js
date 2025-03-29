const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const {
  uploadImage,
  fetchImages,
  deleteImage,
} = require("../controller/cloudinary.controller");
const { upload } = require("../middlewares/upload.middleware");
const router = express.Router();

//upload image
router.post("/upload", authMiddleware, upload.single("image"), uploadImage);
router.get("/images", authMiddleware, fetchImages);
router.delete("/delete/:id", authMiddleware, deleteImage);
module.exports = router;
