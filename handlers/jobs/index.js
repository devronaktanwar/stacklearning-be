const Job = require("../../models/job");
const User = require("../../models/user");

module.exports = {
  async getJobResults({ keyword, location, company }) {
    try {
      const query = {};
      if (keyword) {
        query.jobTitle = { $regex: keyword, $options: "i" };
      }
      if (location) {
        query.location = location;
      }
      if (company) {
        query.companyName = { $regex: company, $options: "i" };
      }

      const jobs = await Job.find(query);

      return { isSuccess: true, data: jobs };
    } catch (err) {
      console.error("Error fetching job results:", err);
      return { isSuccess: false, error: err.message };
    }
  },
  async markAsApplied({ userId, jobId }) {
    try {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: "User not found" });
      const job = await Job.findOne({ jobId });
      if (!job) return res.status(404).json({ message: "Job not found" });
      const isApplied = user?.appliedJobs?.some(
        (appliedJob) => appliedJob.jobId === jobId
      );
      if (!isApplied) {
        user.appliedJobs.push(job);
        await user.save();
        return res.status(200).json({
          isSuccess: true,
          message: "Job applied sucessfully",
          appliedJobs: user.appliedJobs,
        });
      }
      res.json({
        isSuccess: false,
        message: "Job already applied",
        appliedJobs: user.appliedJobs,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
};
