const express = require("express");
const router = express.Router();
const User = require("../db/user.js");

router.get("/", async (req, res) => {
  const { name } = req.query;
  if (!name) {
    const users = await User.find();
    return res.json(users);
  }
  const user = await User.findOne({ name });
  res.json(user);
});

router.post("/", async (req, res) => {
  const { name, timezone } = req.body;
  if (!name) return res.status(400).json({ error: "name required" });

  let user = await User.findOne({ name });
  if (user) return res.json(user);

  user = await User.create({
    name,
    timezone: timezone || "UTC",
  });

  res.json(user);
});

module.exports = router;
