const express = require("express");
const {
  registerUser,
  loginUser,
  viewProfile,
  changePassword,
} = require("../controller/user.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", authMiddleware, viewProfile);
router.put("/changepassword", authMiddleware, changePassword);

module.exports = router;
