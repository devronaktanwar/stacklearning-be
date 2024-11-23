const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();
const jwt = require("jsonwebtoken");
const session = require("express-session");

const nodemailer = require("nodemailer");
const { generateOTP } = require("../models/functions");
const Newsletter = require("../models/newsletter");

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
    res.status(200).json({ isSuccess: true, message: "OTP sent successfully" });
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

router.post("/subscribe-newsletter", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const newSubscription = new Newsletter({ email });
    await newSubscription.save();

    res
      .status(201)
      .json({ message: "Subscription successful", data: newSubscription });
    const mailOptions = {
      from: "ronak@orufy.com",
      to: email,
      subject: "Welcom to StackJobs Newsletter",
      html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Subscription Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f9; color: #333;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
    <tr>
      <td style="background-color: #25a983; padding: 20px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 24px;">Welcome to StackJobs Newsletter</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 20px; text-align: left;">
        <p style="margin: 0; font-size: 16px;">Hi there,</p>
        <p style="margin: 10px 0 20px; font-size: 14px; line-height: 1.6;">
          Thank you for subscribing to our newsletter! We're thrilled to have you on board. You'll now receive the latest updates, news, and exclusive content directly in your inbox.
        </p>
        <p style="margin: 0; font-size: 14px;">Stay tuned for exciting updates!</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 20px; text-align: center;">
        <a href="https://stacklearning.in" style="display: inline-block; padding: 10px 20px; background-color: #25a983; color: #ffffff; text-decoration: none; border-radius: 4px; font-size: 14px;">Visit Our Website</a>
      </td>
    </tr>
    <tr>
      <td style="background-color: #f4f4f9; padding: 10px; text-align: center; font-size: 12px; color: #666;">
        <p style="margin: 0;">You're receiving this email because you subscribed to our newsletter.</p>
        <p style="margin: 5px 0;">If you didn't subscribe, you can <a href="[UNSUBSCRIBE-LINK]" style="color: #25a983; text-decoration: none;">unsubscribe here</a>.</p>
        <p style="margin: 0;">&copy; Stacklearning 2024. All rights reserved.</p>
      </td>
    </tr>
  </table>
</body>
</html>
`,
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error sending email:", error);
        return res
          .status(500)
          .json({ isSuccess: false, message: "Failed to send email" });
      }
      console.log("Email sent: " + info.response);
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: "This email is already subscribed" });
    } else {
      res
        .status(500)
        .json({ message: "An error occurred", error: error.message });
    }
  }
});
module.exports = router;
