const express = require("express");
const app = express();
const { errorHandler } = require("./middleware/errorHandler");

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Job Tracker API is running!",
    status: "success",
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

const jobsRouter = require("./routes/jobs");
app.use("/api/jobs", jobsRouter);

app.use(errorHandler);
module.exports = app;
