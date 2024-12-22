const Company = require("../../models/company");

module.exports = {
  addCompany: async ({ name, website, image, desc }) => {
    try {
      const newCompany = new Company({
        name,
        website,
        image,
        desc,
      });

      await newCompany.save();

      return {
        isSuccess: true,
        message: "company added successfully",
      };
    } catch (err) {
      console.log("Error:", err);
      return {
        isSuccess: false,
        message: "something went wrong",
      };
    }
  },
  getCompany: async ({ company }) => {
    try {
      const query = {};
      if (company) {
        query.name = { $regex: company, $options: "i" };
      }
      const companyDetail = await Company.find(query);
      return { isSuccess: true, data: companyDetail };
    } catch (err) {
      console.error("Error:", err);
      return { isSuccess: false, error: err.message };
    }
  },
};
