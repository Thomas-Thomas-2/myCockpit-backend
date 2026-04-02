var express = require("express");
var router = express.Router();
const { checkBody } = require("../modules/checkBody");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/users");
const { authJWT } = require("../middlewares/authJWT");

// Signup new user
router.post("/signup", async (req, res) => {
  // req.body check
  if (!checkBody(req.body, ["username", "email", "password"])) {
    return res
      .status(400)
      .json({ result: false, error: "Missing or empty fields" });
  }

  const { username, email, password, job, team, leader } = req.body;

  // Check user in BDD
  try {
    const userExisting = await User.findOne({ email });
    if (userExisting) {
      return res
        .status(409)
        .json({ result: false, error: "User already existing" });
    }
  } catch (error) {
    console.log("Error", error);
    return res
      .status(502)
      .json({ result: false, error: "Server error, try later" });
  }

  // User creation
  const hashedPassword = bcrypt.hashSync(password, 10);
  try {
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      job,
      team,
      leader,
    });
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    console.log("Token OK");
    // Set cookie
    res.cookie("access_token", token, {
      httpOnly: true,
      // En prod
      sameSite: "none",
      secure: true,
      // En dev
      // sameSite: "lax",
      // secure: false,
      maxAge: 24 * 60 * 60 * 1000,
      path: "/",
    });
    console.log("Cookie OK");

    // Answer
    res.json({ result: true });
  } catch (error) {
    console.log("Error", error);
    return res
      .status(502)
      .json({ result: false, error: "Server error, try later" });
  }
});

// Signin
router.post("/signin", async (req, res) => {
  // req.body check
  if (!checkBody(req.body, ["email", "password"])) {
    return res
      .status(400)
      .json({ result: false, error: "Missing or empty fields" });
  }

  const { email, password } = req.body;

  // Check user
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        result: false,
        error: "Email invalid, not existing or wrong password",
      });
    }
    const passwordCheck = bcrypt.compareSync(password, user.password);
    if (!passwordCheck) {
      return res
        .status(401)
        .json({ result: false, error: "Invalid email or password" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    // Set cookie
    res.cookie("access_token", token, {
      httpOnly: true,
      // En prod
      sameSite: "none",
      secure: true,
      // En dev
      // sameSite: "lax",
      // secure: false,
      maxAge: 24 * 60 * 60 * 1000,
      path: "/",
    });

    res.json({ result: true, username: user.username });
  } catch (error) {
    return res
      .status(502)
      .json({ result: false, error: "Server error, try later" });
  }
});

// Logout
router.post("/logout", (req, res) => {
  res.clearCookie("access_token", {
    httpOnly: true,
    // En prod
    sameSite: "none",
    secure: true,
    // En dev
    // sameSite: "lax",
    // secure: false,
    path: "/",
  });
  return res.status(200).json({ result: true });
});

// Get info about user connected / check connection need
router.get("/me", authJWT, async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ result: false, error: "Not authorized" });
    }

    return res.status(200).json({
      result: true,
      username: user.username,
    });
  } catch (error) {
    return res.status(401).json({ result: false, error: "Not authorized" });
  }
});

module.exports = router;
