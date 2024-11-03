const express = require("express");
const app = express();
const jobRoutes = require("./routes/jobs");
const userRoutes = require("./routes/users");
const connectDB = require("./config/db");
const port = process.env.PORT || 3000;
const cors = require("cors");
const session = require("express-session");

connectDB();
app.use(
  session({
    secret: "ZXCVBNM",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, httpOnly: true }, // Adjust secure if you're using HTTPS in production
  })
);
app.use(
  cors({
    origin: ["https://www.stacklearning.in","http://localhost:5173"], 
    methods: ["GET", "POST", "DELETE"], 
    allowedHeaders: ["Content-Type", "authkey"], 
    credentials:true
  })
);app.use(express.json());
app.use("/api", jobRoutes);
app.use("/api", userRoutes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
