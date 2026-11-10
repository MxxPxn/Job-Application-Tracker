require("dotenv").config();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const express = require("express");
const app = express();
const { errorHandler } = require("./middleware/errorHandler");
const auth = require("./routes/auth");

// Comma-separated list of origins allowed to make credentialed requests.
// Unset means no cross-origin access at all, never "allow everyone".
const allowedOrigins = (process.env.FRONTEND_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

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
const reportRoutes = require("./routes/reportRoutes");
app.use("/api/jobs", jobsRouter);
app.use("/api/auth", auth);
app.use("/api/reports", reportRoutes);

app.use(errorHandler);
module.exports = app;
