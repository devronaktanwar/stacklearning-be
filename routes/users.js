const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/signup", authMiddleware, async (req, res) => {
  const { fullName, emailAddress, passWord } = req.body;
  try {
    const existingUser = await User.findOne({ emailAddress });
    console.log("existingUser",existingUser)
    if (existingUser) {
      return res.status(400).json({
        isSuccess: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(passWord, 10);

    const newUser = new User({
        fullName,
        emailAddress,
        passWord:hashedPassword
      });

      await newUser.save();
      res.status(201).json({ message: "User created successfully", newUser });
  } catch (error) {
    res.status(500).json({ message: error});
  }
});
module.exports = router;
