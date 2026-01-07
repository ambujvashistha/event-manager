const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  profileIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  startUTC: {
    type: Date,
    required: true,
  },
  endUTC: {
    type: Date,
    required: true,
  },
  createdAtUTC: {
    type: Date,
    default: Date.now,
  },
  updatedAtUTC: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Event", eventSchema);
