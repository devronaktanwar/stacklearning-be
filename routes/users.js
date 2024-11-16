const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();
const jwt = require("jsonwebtoken");
const session = require("express-session");

const nodemailer = require("nodemailer");
const { generateOTP } = require("../models/functions");


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "ronak@orufy.com",
    pass: "qvgq mmed qmmo jklg",
  },
});

router.post("/signup", authMiddleware, async (req, res) => {
  const { fullName, emailAddress, passWord } = req.body;
  try {
    const existingUser = await User.findOne({ emailAddress });
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
      passWord: hashedPassword,
    });

    await newUser.save();
    const user = await User.findOne({ emailAddress });
    const token = jwt.sign({ id: user._id }, "your_jwt_secret", {
      expiresIn: "1h",
    });
    res.status(201).json({
      isSuccess: true,
      message: "User created successfully",
      user: newUser,
      token: token,
    });
  } catch (error) {
    res.status(500).json({ isSuccess: false, message: error });
  }
});
router.post("/login", async (req, res) => {
  const { emailAddress, passWord } = req.body;

  try {
    const existingUser = await User.findOne({ emailAddress });
    if (!existingUser) {
      return res.status(400).json({
        isSuccess: false,
        message: "Invaild Email, Please Sign Up",
      });
    }
    const isPasswordValid = await bcrypt.compare(
      passWord,
      existingUser.passWord
    );

    if (!isPasswordValid) {
      return res.status(400).json({
        isSuccess: false,
        message: "Invalid password",
      });
    }
    const token = jwt.sign({ id: existingUser._id }, "your_jwt_secret", {
      expiresIn: "1h",
    });
    res.status(200).json({
      isSuccess: true,
      message: "Login successful",
      token: token,
      user: {
        id: existingUser._id,
        emailAddress: existingUser.emailAddress,
        fullName: existingUser.fullName,
      },
    });
  } catch (err) {
    console.log("Error:", err);
  }
});

router.post("/send-otp", async (req, res) => {
  const { emailAddress } = req.body;

  const otp = generateOTP();

  req.session.OTP = otp; 
    // Mail options
    const mailOptions = {
      from: "ronak@orufy.com",
      to: emailAddress,
      subject: "OTP Verification",
      text: `Your OTP is: ${otp}`,
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error sending email:", error);
        return res
          .status(500)
          .json({ isSuccess: false, message: "Failed to send email" });
      }
      console.log("Email sent: " + info.response);
      res
        .status(200)
        .json({ isSuccess: true, message: "OTP sent successfully" });
    });
  });

router.post("/verify-otp", (req, res) => {
  const { userInputOtp } = req.body;

  if (req.session.OTP === userInputOtp) {
    req.session.OTP = null;
    return res.json({
      isSuccess: true,
      message: "OTP Verified Successfully",
    });
  }

  return res.json({
    isSuccess: false,
    message: "Invalid OTP",
  });
});
module.exports = router;
