const Job = require("../../models/job");

module.exports = {
  async getJobResults({ keyword, location,company }) {
    try {
      const query = {};
      if (keyword) {
        query.jobTitle = { $regex: keyword, $options: "i" }; 
      }
      if (location) {
        query.location = location;
      }
      if(company){
        query.companyName = { $regex: company, $options: "i" };
      }
  
      const jobs = await Job.find(query);
  
      return { isSuccess: true, data: jobs };
    } catch (err) {
      console.error("Error fetching job results:", err);
      return { isSuccess: false, error: err.message };
    }
  }
};
