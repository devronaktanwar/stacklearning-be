const express = require('express');
const app = express();
const jobRoutes = require('./routes/jobs');
const connectDB = require('./config/db');
const port = process.env.PORT || 4000;
const cors = require('cors');

connectDB()
app.use(cors());
app.use(express.json());
app.use('/api', jobRoutes);

  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
