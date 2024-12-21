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
  getCompany: async ({ name }) => {
    try {
      const query = {};
      if (name) {
        query.name = { $regex: name, $options: "i" };
      }
      const company = await Company.find(query);
      return { isSuccess: true, data: company };
    } catch (err) {
      console.error("Error:", err);
      return { isSuccess: false, error: err.message };
    }
  },
};
