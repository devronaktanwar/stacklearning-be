const express = require("express");
const { generateRandomString } = require("../models/functions");
const Job = require("../models/job");
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/user");
const router = express.Router();

router.get("/all-jobs", authMiddleware, async (req, res) => {
  try {
    const jobs = await Job.find();
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});
router.post("/add-job", authMiddleware, async (req, res) => {
  const {
    jobTitle,
    companyName,
    tagsArray,
    location,
    date,
    link,
    jobDescriptionHtml,
    jobDescriptionText,
    image,
    jobType,
    experienceRequired,
    domain,
  } = req.body;

  const jobId = generateRandomString(10);

  const data = {
    jobTitle,
    companyName,
    tagsArray,
    location,
    date,
    link,
    jobDescriptionHtml,
    jobDescriptionText,
    image,
    jobType,
    experienceRequired,
    jobId,
    domain,
  };

  const newJob = new Job(data);

  try {
    await newJob.save();
    res.json({
      isSuccess: true,
      message: "Job created successfully",
    });
  } catch (error) {
    res.status(500).json({
      isSuccess: false,
      message: "Error creating job",
      error: error.message,
    });
  }
});

router.delete("/job/:jobId", authMiddleware, async (req, res) => {
  const { jobId } = req.params;

  try {
    const deletedJob = await Job.findOneAndDelete({ jobId: jobId });
    if (!deletedJob) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.json({
      isSuccess: true,
      message: "Job deleted successfully",
      deletedJob,
    });
  } catch (error) {
    res.status(500).json({
      isSuccess: false,
      message: "Error deleting job",
      error: error.message,
    });
  }
});

router.post("/jobs/save", async (req, res) => {
  const { emailAddress, jobId } = req.body;
  try {
    const user = await User.findOne({ emailAddress: emailAddress });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.savedJobs.includes(jobId)) {
      user.savedJobs.push(jobId);
      await user.save();
    }

    res.status(200).json({ message: "Job saved successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/jobs/saved/:emailAddress", async (req, res) => {
  const { emailAddress } = req.params;

  try {
    console.log(1);
    const user = await User.findOne({ emailAddress: emailAddress });
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ isSuccess: true, savedJobs: user.savedJobs });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});
module.exports = router;
