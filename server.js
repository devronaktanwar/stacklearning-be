const express = require("express");
require("dotenv").config();
const app = express();
const jobRoutes = require("./routes/jobs");
const userRoutes = require("./routes/users");
const companyRoutes = require("./routes/companies");
const connectDB = require("./config/db");
const port = process.env.PORT || 3000;
const cors = require("cors");
const session = require("express-session");

connectDB();
app.use(
  cors({
    origin: [
      "https://www.stacklearning.in/",
      "https://www.stacklearning.in",
      "http://localhost:5173",
      "https://betastacklearning.vercel.app",
      "http://localhost:5174",
      "https://www.jobscript.in/",
      "https://www.jobscript.in",
    ],
    methods: ["GET", "POST", "DELETE"],
    allowedHeaders: ["Content-Type", "authkey"],
    credentials: true,
  })
);
app.use(express.json());
app.use("/api", jobRoutes);
app.use("/api", userRoutes);
app.use("/api", companyRoutes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
