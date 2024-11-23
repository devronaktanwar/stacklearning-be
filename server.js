const express = require("express");
const app = express();
const jobRoutes = require("./routes/jobs");
const userRoutes = require("./routes/users");
const connectDB = require("./config/db");
const port = process.env.PORT || 3000;
const cors = require("cors");
const session = require("express-session");
const MongoStore = require("connect-mongo");
connectDB();
app.use(
  session({
    secret: "ZXCVBNM",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: "mongodb+srv://ronaktanwar0508:c3LCyoOIi95mdCeu@cluster0.gpz5u.mongodb.net/Stacklearning?retryWrites=true&w=majority&appName=Cluster0",
  }),
    cookie: {
      maxAge: 10 * 60 * 1000,
      secure: false,
      httpOnly: true,
    },
  })
);
app.use(
  cors({
    origin: ["https://www.stacklearning.in", "http://localhost:5173","https://betastacklearning.vercel.app"],
    methods: ["GET", "POST", "DELETE"],
    allowedHeaders: ["Content-Type", "authkey"],
    credentials: true,
  })
);
app.use(express.json());
app.use("/api", jobRoutes);
app.use("/api", userRoutes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
