const Job = require("../../models/job");

module.exports = {
  async getJobResults({ keyword, location }) {
    try {
      const jobs = await Job.find({
        jobTitle: { $regex: keyword, $options: "i" },
        location: location,
      });

      return { isSuccess: true, data: jobs };
    } catch (err) {
      console.error("Error fetching job results:", err);
      return { isSuccess: false, error: err.message };
    }
  },
};
