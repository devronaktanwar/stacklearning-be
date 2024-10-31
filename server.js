const express = require("express");
const app = express();
const jobRoutes = require("./routes/jobs");
const userRoutes = require("./routes/users");
const connectDB = require("./config/db");
const port = process.env.PORT || 3000;
const cors = require("cors");

connectDB();
app.use(
  cors({
    origin: ["https://www.stacklearning.in","http://localhost:5173"], 
    methods: ["GET", "POST", "DELETE"], 
    allowedHeaders: ["Content-Type", "authkey"], 
  })
);app.use(express.json());
app.use("/api", jobRoutes);
app.use("/api", userRoutes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
