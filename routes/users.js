var express = require("express");
var router = express.Router();
const { checkBody } = require("../modules/checkBody");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
// const User = require("../models/users");
const { authJWT } = require("../middlewares/authJWT");
const pool = require("../models/connection");

// Signup new user
router.post("/signup", async (req, res) => {
  // req.body check
  if (
    !checkBody(req.body, ["username", "email", "password", "team", "leader"])
  ) {
    return res
      .status(400)
      .json({ result: false, error: "Missing or empty fields" });
  }

  const { username, email, password, job, team, leader } = req.body;

  // Check user in BDD
  try {
    // const userExisting = await User.findOne({ email });
    const userExisting = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email.trim().toLowerCase()],
    );

    if (userExisting.rows[0]) {
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

  // Check if leader already exists for team
  try {
    if (leader === "true") {
      // const leaderExisting = await User.findOne({ team, leader: true });
      const leaderExisting = await pool.query(
        "SELECT * FROM users WHERE team = $1 AND leader = true",
        [team.trim()],
      );
      if (leaderExisting.rows[0]) {
        return res.status(409).json({
          result: false,
          error: "Leader already exists, you can't select this option.",
        });
      }
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
    const leaderValue = leader === "true" ? true : false;
    const newUser = await pool.query(
      "INSERT INTO users (username, email, password, job, team, leader) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id,team,leader",
      [
        username.trim(),
        email.trim().toLowerCase(),
        hashedPassword,
        job,
        team.trim(),
        leaderValue,
      ],
    );
    // const newUser = await User.create({
    //   username,
    //   email,
    //   password: hashedPassword,
    //   job,
    //   team,
    //   leader: leader === "true",
    // });
    const token = jwt.sign(
      {
        userId: newUser.rows[0].id,
        team: newUser.rows[0].team,
        leader: newUser.rows[0].leader,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      },
    );
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
    // const user = await User.findOne({ email });
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email.trim().toLowerCase(),
    ]);

    if (!user.rows[0]) {
      return res.status(401).json({
        result: false,
        error: "Email invalid, not existing or wrong password",
      });
    }
    const passwordCheck = bcrypt.compareSync(password, user.rows[0].password);
    if (!passwordCheck) {
      return res
        .status(401)
        .json({ result: false, error: "Invalid email or password" });
    }

    const token = jwt.sign(
      {
        userId: user.rows[0].id,
        team: user.rows[0].team,
        leader: user.rows[0].leader,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      },
    );
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

    res.json({ result: true, username: user.rows[0].username });
  } catch (error) {
    console.log("Error", error);
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
    const userId = req.user.userId;
    // const user = await User.findById(userId);
    const user = await pool.query("SELECT * FROM users WHERE id = $1", [
      userId,
    ]);

    if (!user.rows[0]) {
      return res.status(401).json({ result: false, error: "Not authorized" });
    }

    return res.status(200).json({
      result: true,
      username: user.rows[0].username,
      team: user.rows[0].team,
      leader: user.rows[0].leader,
    });
  } catch (error) {
    return res.status(401).json({ result: false, error: "Not authorized" });
  }
});

module.exports = router;
