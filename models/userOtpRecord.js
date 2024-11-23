const mongoose = require("mongoose");

const userOtpRecordSchema = new mongoose.Schema({
  otp: { type: Number, required: true },
  emailAddress: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date },
});

const Otp = mongoose.model("Otp", userOtpRecordSchema,"OtpVerificationRecords");
module.exports = Otp;
