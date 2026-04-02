require("dotenv").config();

var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const cors = require("cors");
require("./models/connection");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var projectsRouter = require("./routes/projects");

var app = express();

const allowedOrigins = [
  "http://localhost:3001",
  "https://my-cockpit-frontend.vercel.app",
];

const corsOptions = {
  origin: (origin, callback) => {
    // authorize origin undefined
    if (!origin) return callback(null, true);
    // authorize exact origin
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // authorize preview vercel
    if (origin.endsWith(".vercel.app")) return callback(null, true);
    return callback(new Error("Not allowed by CORS: " + origin));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/projects", projectsRouter);

module.exports = app;
