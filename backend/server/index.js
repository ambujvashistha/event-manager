const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv =require("dotenv");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error(err));

app.get("/", (req, res) => {
  res.send("API running");
});

app.listen(process.env.PORT || 5000, () => {
  console.log(`server running ${process.env.PORT}`);
});
