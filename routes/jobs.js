const express = require("express");
const { generateRandomString } = require("../models/functions");
const Job = require("../models/job");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

router.get('/all-jobs',authMiddleware,async(req,res)=>{
  try {
    const jobs = await Job.find(); 
    res.json(jobs); 
} catch (error) {
    res.status(500).json({ message: 'Server Error' });
}
})
router.post("/add-job", authMiddleware,async (req, res) => {
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
    domain
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
    domain
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

module.exports = router;
