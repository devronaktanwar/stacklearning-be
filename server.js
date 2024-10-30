const express = require("express");
const app = express();
const jobRoutes = require("./routes/jobs");
const connectDB = require("./config/db");
const port = process.env.PORT || 4000;
const cors = require("cors");
const allowedOrigins = ["https://stacklearning.in", "http://localhost:5173"];

const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST","DELETE"],
  allowedHeaders: ["authkey", "Content-Type"],
};
connectDB();
// app.use(cors(corsOptions));
app.use(cors());
app.use(express.json());
app.use("/api", jobRoutes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
