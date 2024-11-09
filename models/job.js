
const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    jobTitle: { type: String, required: true },
    companyName: { type: String, required: true},
    tagsArray: { type: Array, required: true },
    location: { type: String, required: true },
    date: { type: String, required: true },
    link: { type: String, required: true },
    jobDescriptionHtml: { type: String, required: true },
    jobDescriptionText: { type: String, required: true },
    image: { type: String, required: true },
    experienceRequired: { type: String, required: true },
    jobId: { type: String, required: true,unique:true },
    jobType: { type: String, required: true },
    domain: { type: String, required: true },
    jobLocation: { type: String, required: true }
});

const Job = mongoose.model('Job', jobSchema,"Jobs");
module.exports = Job;
