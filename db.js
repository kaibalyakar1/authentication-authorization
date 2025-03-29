require("dotenv").config();
const express = require("express");
const { default: mongoose } = require("mongoose");

const connectDb = async () => {
  console.log("MongoDB URL:", process.env.MONGOURL);
  try {
    await mongoose.connect(process.env.MONGOURL).then(() => {
      console.log("Connected to the database");
    });
  } catch (error) {
    console.log("Error connecting to the database: ", error);
    process.exit(1);
  }
};

module.exports = { connectDb };
