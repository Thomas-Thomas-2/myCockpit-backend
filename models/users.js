const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },

  job: {
    type: String,
    default: null,
  },
  team: {
    type: String,
    default: null,
  },
});

const User = mongoose.model("users", userSchema);

module.exports = User;
