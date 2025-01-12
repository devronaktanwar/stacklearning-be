const express = require("express");
const {
  addCompany,
  getCompany,
  getAllCompanies,
  updateCompany,
  deleteCompany,
} = require("../handlers/companies");
const router = express.Router();

router.post("/add-company", async (req, res) => {
  const response = await addCompany(req.body);
  res.send(response);
});
router.post("/get-company-by-name", async (req, res) => {
  const response = await getCompany(req.body);
  res.send(response);
});
router.get("/get-all-companies", async (req, res) => {
  const response = await getAllCompanies();
  res.send(response);
});
router.put("/update-company/:id", async (req, res) => {
  const { id } = req.params;
  const response = await updateCompany(req.body, id);
  res.send(response);
});

router.delete("/delete-company/:id", async (req, res) => {
  const { id } = req.params;
  const response = await deleteCompany({ id });
  res.send(response);
});
module.exports = router;
