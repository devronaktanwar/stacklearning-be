const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();
const session = require("express-session");

const nodemailer = require("nodemailer");
const { generateOTP } = require("../models/functions");
const Newsletter = require("../models/newsletter");
const Otp = require("../models/userOtpRecord");
const {
  googleLoginHandler,
  verifyGoogleAuth,
  signUpUser,
  loginUser,
  resetPassword,
  checkIfEmailExists,
} = require("../handlers/users");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "dev.ronaktanwar@gmail.com",
    pass: "ltyg eggl jzmi jxyp",
  },
});

router.post("/signup", authMiddleware, async (req, res) => {
  const response = await signUpUser(req.body);
  res.send(response);
});
router.post("/login", async (req, res) => {
  const response = await loginUser(req.body);
  res.send(response);
});

router.post("/send-otp", async (req, res) => {
  const { emailAddress, isForgetFlow = false } = req.body;
  const existingUser = await User.findOne({ emailAddress });

  if (existingUser && !isForgetFlow) {
    return res.json({
      isSuccess: false,
      message: "User already exists",
    });
  }
  const otp = generateOTP();
  const otpData = new Otp({
    emailAddress,
    otp,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
  });
  const mailOptions = {
    from: "dev.ronaktanwar@gmail.com",
    to: emailAddress,
    subject: "OTP Verification",
    text: `Your OTP is: ${otp}`,
  };

  try {
    await Otp.findOneAndDelete({ emailAddress: emailAddress });
    await otpData.save();
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
  } catch (err) {
    console.log("Error:", err);
  }
});

router.post("/verify-otp", async (req, res) => {
  const { userInputOtp, email } = req.body;
  const otpRecord = await Otp.findOne({ emailAddress: email });

  if (!otpRecord) {
    return res
      .status(400)
      .json({ isSuccess: false, message: "No OTP found for this phone" });
  }

  if (otpRecord.expiresAt < Date.now()) {
    return res.status(400).json({ isSuccess: false, message: "OTP expired" });
  }

  if (otpRecord.otp === userInputOtp) {
    return res.status(200).json({ isSuccess: true, message: "OTP verified" });
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
      return res
        .status(400)
        .json({ isSuccess: false, message: "Email is required" });
    }

    const newSubscription = new Newsletter({ email });
    await newSubscription.save();

    res.status(201).json({
      isSuccess: true,
      message: "Subscription successful",
      data: newSubscription,
    });
    const mailOptions = {
      from: "dev.ronaktanwar@gmail.com",
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
      res.status(400).json({
        isSuccess: false,
        message: "This email is already subscribed",
      });
    } else {
      res.status(500).json({
        isSuccess: false,
        message: "An error occurred",
        error: error.message,
      });
    }
  }
});

router.post("/get-user-details", async (req, res) => {
  try {
    const { userId } = req.body;
    console.log("userId:", userId);
    const userDetail = await User.findById(userId);
    console.log("userDetail:", userDetail);
    return res.json({
      isSuccess: true,
      user: userDetail,
    });
  } catch (err) {
    console.log("Error:", err);
    return res.json({
      isSuccess: false,
      message: "something went wrong",
    });
  }
});

router.post("/update-user-details", async (req, res) => {
  try {
    const { userId, fullName, emailAddress } = req.body;
    const updatedUserDetails = await User.findByIdAndUpdate(userId, {
      fullName: fullName,
      emailAddress: emailAddress,
    });
    return res.json({
      isSuccess: true,
      updatedUser: updatedUserDetails,
    });
  } catch (err) {
    return res.json({
      isSuccess: false,
      error: err,
    });
  }
});

router.post("/update-password", async (req, res) => {
  try {
    const { userId, oldPassword, newPassword } = req.body;
    const userDetails = await User.findById(userId);
    const isOldPasswordValid = await bcrypt.compare(
      oldPassword,
      userDetails.passWord
    );

    if (!isOldPasswordValid) {
      return res.json({
        isSuccess: false,
        message: "invalid old password",
      });
    }

    return res.json({
      isSuccess: true,
      message: "password changed successfully",
    });
  } catch (err) {}
});
router.get("/google", async (req, res) => {
  const prevUrl = req.query.prevUrl ?? null;
  const data = await googleLoginHandler({ prevUrl });
  res.redirect(data);
});

router.get("/google/callback", async (req, res) => {
  const { code, state } = req.query;
  const { prevUrl, userId } = await verifyGoogleAuth({ code, state });
  res.redirect(prevUrl);
});

router.post("/reset-password", async (req, res) => {
  const response = await resetPassword(req.body);
  res.send(response);
});
router.post("/check-if-email-exists", async (req, res) => {
  const response = await checkIfEmailExists(req.body);
  res.send(response);
});
router.post("/check-if-userId-valid", async (req, res) => {
  const response = await checkIfUserIdValid(req.body);
  res.send(response);
});
module.exports = router;
