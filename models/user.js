
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    emailAddress: { type: String, required: true },
    passWord: { type: String, required: true },
    savedJobs: [{ type: mongoose.Schema.Types.String, ref: 'Job' }]
});

const User = mongoose.model('User', userSchema,"Users");
module.exports = User;
