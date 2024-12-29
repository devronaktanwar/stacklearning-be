const express = require("express");
const { generateRandomString } = require("../models/functions");
const Job = require("../models/job");
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/user");
const { getJobResults, markAsApplied } = require("../handlers/jobs");
const router = express.Router();

router.get("/all-jobs", authMiddleware, async (req, res) => {
  try {
    const jobs = await Job.find();
    return res.json(jobs);
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
    jobLocationType,
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
    jobLocationType,
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
  const { userId, jobId } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const job = await Job.findOne({ jobId });
    if (!job) return res.status(404).json({ message: "Job not found" });

    const isJobSaved = user?.savedJobs?.some(
      (savedJob) => savedJob.jobId === jobId
    );
    if (!isJobSaved) {
      user.savedJobs.push(job);
      await user.save();
      return res.status(200).json({
        isSuccess: true,
        message: "Job saved successfully",
        savedJobs: user.savedJobs,
      });
    }
    res.json({
      isSuccess: false,
      message: "Job is already saved",
      savedJobs: user.savedJobs,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/mark-as-applied", async (req, res) => {
  const response = await markAsApplied(req.body);
  res.send(response);
});

// router.get("/jobs/saved/:userId", async (req, res) => {
//   const { userId } = req.params;
//   try {
//     const user = await User.findOne({ userId });
//     if (!user) return res.status(404).json({ message: "User not found" });

//     res.status(200).json({ isSuccess: true, savedJobs: user.savedJobs });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

router.get("/get-job-detail/:jobId", async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const job = await Job.findOne({ jobId: jobId });

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error });
  }
});
router.get("/get-jobs-by-domain/:domain", async (req, res) => {
  try {
    const domain = req.params.domain;
    const jobs = await Job.find({ domain: domain });

    if (!jobs) {
      return res.status(404).json({ message: "Job not found" });
    }
    return res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error });
  }
});

router.get("/search", async (req, res) => {
  const response = await getJobResults(req.query);
  return res.json(response);
});
module.exports = router;
