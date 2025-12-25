import express from "express";
import User from "../models/User.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: "Username required" });
  }

  let user = await User.findOne({ username });

  if (!user) {
    user = await User.create({ username });
  }

  res.json({
    userId: user._id,
    username: user.username,
  });
});

export default router;

