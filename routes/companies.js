const express = require("express");
const { addCompany, getCompany } = require("../handlers/companies");
const router = express.Router();

router.post("/add-company",async(req,res)=>{
    const response = await addCompany(req.body);
    res.send(response);
})
router.post("/get-company-by-name",async(req,res)=>{
    const response = await getCompany(req.body);
    res.send(response);
})
module.exports = router;