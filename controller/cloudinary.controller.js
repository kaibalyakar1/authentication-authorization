const uploadToCloudinary = require("../cloudinary/helper");
const Image = require("../model/image.model");
const User = require("../model/user.model");
const fs = require("fs");
const cloudinary = require("cloudinary").v2;
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    // Upload image to cloudinary
    const image = await uploadToCloudinary(req.file.path);
    const uploadedImage = new Image({
      url: image.url,
      publicId: image.publicId,
      uploadedBy: req.user.id,
    });
    await uploadedImage.save();
    fs.unlinkSync(req.file.path);
    res
      .status(201)
      .json({ message: "Image uploaded successfully", uploadedImage });
  } catch (error) {
    console.log("Error uploading image: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const fetchImages = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "desc" ? -1 : 1; // Fixed sorting logic

    const totalImages = await Image.countDocuments();
    const totalPages = Math.ceil(totalImages / limit);

    const images = await Image.find()
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit);

    const uploadedImages = await Image.find({ uploadedBy: req.user.id });

    res.status(200).json({
      images,
      uploadedImages, // Images uploaded by the authenticated user
      currentPage: page,
      totalPages,
      totalImages,
    });
  } catch (error) {
    console.log("Error fetching images: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const deleteImage = async (req, res) => {
  try {
    //get the image id from the request

    const imageId = req.params.id;

    //find the image in the database
    const image = await Image.findById(imageId);
    if (!image) {
      return res.status(404).json({ error: "Image not found" });
    }
    //find user by id and image id
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    //if(image.uploadedBy !== req.user.id) return res.status(401).json({error:"Unauthorized"})

    if (image.uploadedBy.toString() !== req.user.id)
      return res.status(401).json({ error: "Unauthorized" });
    //delete the image from cloudinary

    await cloudinary.uploader.destroy(image.publicId);
    //delete the image from the database

    await Image.findByIdAndDelete(imageId);
    res.status(200).json({ message: "Image deleted successfully" });
  } catch (error) {
    console.log("Error deleting image: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
module.exports = { uploadImage, fetchImages, deleteImage };
