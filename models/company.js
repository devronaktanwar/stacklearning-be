const mongoose = require("mongoose");

const companySchema = new mongoose.Schema({
  name: { type: String, required: true },
  website: { type: String, required: true },
  image: { type: String, required: true },
  desc: { type: String, required: true },
});

const Company = mongoose.model("Company", companySchema, "Companies");
module.exports = Company;
