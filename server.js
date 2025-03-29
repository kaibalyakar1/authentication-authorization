require("dotenv").config();
const express = require("express");
const { connectDb } = require("./db");
const userRoutes = require("./routes/user.routes");
const cloudinaryRoutes = require("./routes/cloudinary.routes");

const app = express();
app.use(express.json()); // Enables JSON parsing in requests
app.use(express.urlencoded({ extended: true }));

app.use("/api/user", userRoutes);
app.use("/api/cloudinary", cloudinaryRoutes);
const start = async () => {
  try {
    await connectDb();
    app.listen(8080, () => {
      console.log("Server is running on port 3000");
    });
  } catch (error) {
    console.log("Error connecting to the database: ", error);
    process.exit(1);
  }
};

start();
