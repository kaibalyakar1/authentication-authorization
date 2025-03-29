const dotenv = require("dotenv");
dotenv.config();
const JsonWebTokenError = require("jsonwebtoken");
const jwt = require("jsonwebtoken");
const express = require("express");
const User = require("../model/user.model");
const bcrypt = require("bcryptjs");

const registerUser = async (req, res) => {
  try {
    console.log("Registering user:", req.body);
    const { userName, email, password, role } = req.body;

    const checkUser = await User.findOne({ $or: [{ userName }, { email }] });
    if (checkUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      userName,
      email,
      password: hashedPassword,
      role: role || "user",
    });

    await user.save();

    res
      .status(201)
      .json({ success: true, message: "User registered successfully", user });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password"); // Include password for verification
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      user: { id: user._id, email: user.email, role: user.role }, // Avoid returning sensitive data
      accessToken,
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const viewProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const changePassword = async (req, res) => {
  try {
    const user = req.user.id;
    const { oldPassword, newPassword } = req.body;

    const isUser = await User.findById(user);
    if (!isUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(oldPassword, isUser.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    isUser.password = hashedPassword;
    await isUser.save();

    res.status(200).json({ success: true, message: "Password changed" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  viewProfile,
  changePassword,
};
