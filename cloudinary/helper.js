const cloudinary = require("./config.js");

const uploadToCloudinary = async (file) => {
  try {
    const result = await cloudinary.uploader.upload(file);

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

module.exports = uploadToCloudinary;
