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
  getAllCompanies: async () => {
    try {
      const data = await Company.find();
      return {
        isSuccess: true,
        data: data,
      };
    } catch (err) {
      console.error("Error:", err);
      return { isSuccess: false, error: err.message };
    }
  },

  updateCompany: async ({ name, website, image, desc }, id) => {
    try {
      const updatedCompany = await Company.findByIdAndUpdate(
        id,
        { name, website, image, desc },
        { new: true } // Return the updated document
      );

      if (!updatedCompany) {
        return { message: "Company not found" };
      }

      return {
        message: "Company updated successfully",
        data: updatedCompany,
      };
    } catch (error) {
      console.log("Error:", error);
      return { message: "Failed to update company", error };
    }
  },
  deleteCompany: async ({ id }) => {
    try {
      const deletedCompany = await Company.findByIdAndDelete(id);

      if (!deletedCompany) {
        return res.status(404).json({ message: "Company not found" });
      }

      return {
        message: "Company deleted successfully",
        data: deletedCompany,
      };
    } catch (error) {
      return { message: "Failed to delete company", error };
    }
  },
};
