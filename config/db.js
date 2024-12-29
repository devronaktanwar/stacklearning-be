const mongoose = require("mongoose");
const URI =
  process.env.URI ||
  "mongodb+srv://devronaktanwar:j5Ofd4JcB1npRxqU@stackjobs.p8yup.mongodb.net/?retryWrites=true&w=majority&appName=stackjobs";
const connectDB = async () => {
  try {
    await mongoose.connect(URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
};

module.exports = connectDB;
