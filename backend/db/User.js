const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: false,
  },
  timezone: {
    type: String,
    required: true,
    default: "UTC",
  },
});

module.exports = mongoose.model("User", userSchema);
