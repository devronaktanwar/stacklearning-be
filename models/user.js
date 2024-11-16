
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    emailAddress: { type: String, required: true },
    passWord: { type: String, required: true },
    savedJobs: [
        {
            jobId: { type: String, required: true },
            jobTitle: { type: String, required: true },
            companyName: { type: String, required: true },
            tagsArray: { type: Array, required: true },
            location: { type: String, required: true },
            date: { type: String, required: true },
            link: { type: String, required: true },
            jobDescriptionHtml: { type: String, required: true },
            jobDescriptionText: { type: String, required: true },
            image: { type: String, required: true },
            experienceRequired: { type: String, required: true },
            jobType: { type: String, required: true },
            domain: { type: String, required: true },
            jobLocation: { type: String, required: false }
        }
    ]
});

const User = mongoose.model('User', userSchema,"Users");
module.exports = User;
