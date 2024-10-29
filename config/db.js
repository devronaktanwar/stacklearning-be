const mongoose = require('mongoose');
const uri = "mongodb+srv://ronaktanwar0508:c3LCyoOIi95mdCeu@cluster0.gpz5u.mongodb.net/Stacklearning?retryWrites=true&w=majority&appName=Cluster0";
const connectDB = async () => {
    try {
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected');
    } catch (error) {
        console.error('MongoDB connection failed:', error);
        process.exit(1); 
    }
};

module.exports = connectDB;
