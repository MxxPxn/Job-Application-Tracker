const jobStore = require("../data/jobStore");

const VALID_STATUSES = ["applied", "interview", "offer", "rejected"];

const createJob = async (req, res) => {
  const { company, position, location, salary, deadlineDate, jobUrl, platform, status, appliedDate, notes, priority } = req.body;
  const userId = req.user.userId;

  const errors = [];
  if (!company || typeof company !== "string") {
    errors.push("company is required and must be a string");
  }
  if (!position || typeof position !== "string") {
    errors.push("position is required and must be a string");
  }
  if (!status || !VALID_STATUSES.includes(status)) {
    errors.push(`status must be one of: ${VALID_STATUSES.join(", ")}`);
  }
  if (platform !== undefined && platform !== null &&(typeof platform !== "string" || platform.length > 100 || platform.trim().length === 0 )) {
    errors.push("platform must be a string with a maximum length of 100 characters or null");
  }
  if (!appliedDate || isNaN(Date.parse(appliedDate))) {
    errors.push("appliedDate is required and must be a valid date");
  }
  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  const job = await jobStore.addJob({
    company: company.trim(),
    position: position.trim(),
    status,
    location: location ? location.trim() : "",
    salary: salary ? salary.trim() : "",
    deadlineDate: deadlineDate ? deadlineDate.trim() : null,
    jobUrl: jobUrl ? jobUrl.trim() : "",
    platform: platform ? platform.trim() : null,
    appliedDate,
    priority: priority ? priority.trim() : 'medium',
    notes: notes ? notes.trim() : "",
    user_id: userId,
  });
  res.status(201).json({ success: true, data: job });
};

const getJobs = async (req, res) => {
  const userId = req.user.userId;
  const { status, page = "1", limit = "10" } = req.query;
  const filters = { userId };
  const pageNum = parseInt(page);
  const limitNum = Math.min(parseInt(limit), 100); // Cap limit at 100

  if (status) {
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status filter. Must be one of: ${VALID_STATUSES.join(", ")}`,
      });
    }
    filters.status = status;
  }
  const VALID_PRIORITIES = ["low", "medium", "high"];
  if (req.query.priority) {
    if (!VALID_PRIORITIES.includes(req.query.priority)) {
      return res.status(400).json({
        success: false,
        message: `Invalid priority filter. Must be one of: ${VALID_PRIORITIES.join(", ")}`,
      });
    }
    filters.priority = req.query.priority;
  }

  if (req.query.platform) { 
   if (req.query.platform.length <= 100) {
      filters.platform = req.query.platform;
   } else {
    return res.status(400).json({
      success: false,
      message: "Invalid platform filter. Must be a string with a maximum length of 100 characters",
    });
   }
  }

  if (isNaN(pageNum) || pageNum < 1) {
    return res
      .status(400)
      .json({ success: false, message: "Page must be a positive integer" });
  }
  if (isNaN(limitNum) || limitNum < 1) {
    return res
      .status(400)
      .json({ success: false, message: "Limit must be a positive integer" });
  }
  const offset = (pageNum - 1) * limitNum;
  const { jobs, total } = await jobStore.getAllJobs(filters, limitNum, offset);
  const totalPages = Math.ceil(total / limitNum);
  res.json({
    success: true,
    data: jobs,
    pagination: { total, page: pageNum, totalPages, limit: limitNum },
  });
};

const getJobById = async (req, res) => {
  const userId = req.user.userId;
  if (isNaN(req.params.id)) {
    return res.status(400).json({ success: false, message: "Invalid job ID" });
  }
  const job = await jobStore.getJobById(req.params.id, userId);
  if (!job) {
    return res.status(404).json({ success: false, message: "Job not found" });
  }
  return res.json({ success: true, data: job });
};

const updateJob = async (req, res) => {
  const userId = req.user.userId;
  if (isNaN(req.params.id)) {
    return res.status(400).json({ success: false, message: "Invalid job ID" });
  }
  const job = await jobStore.getJobById(req.params.id, userId);
  const allowedUpdates = {};

  if (req.body.company !== undefined) {
    allowedUpdates.company = req.body.company;
  }
  if (req.body.position !== undefined) {
    allowedUpdates.position = req.body.position;
  }
  if (req.body.status !== undefined) {
    if (VALID_STATUSES.includes(req.body.status)) {
      allowedUpdates.status = req.body.status;
    } else {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
      });
    }
  }
  if (req.body.appliedDate !== undefined) {
    if (!isNaN(Date.parse(req.body.appliedDate))) {
      allowedUpdates.appliedDate = req.body.appliedDate;
    } else {
      return res
        .status(400)
        .json({ success: false, message: "appliedDate must be a valid date" });
    }
  }
  if (req.body.notes !== undefined) {
    allowedUpdates.notes = req.body.notes;
  }

  if (req.body.location !== undefined) {
    allowedUpdates.location = req.body.location;
  }
  if (req.body.salary !== undefined) {
    allowedUpdates.salary = req.body.salary;
  }
  if (req.body.deadlineDate !== undefined) {
    if (!isNaN(Date.parse(req.body.deadlineDate))) {
      allowedUpdates.deadlineDate = req.body.deadlineDate;
    } else {
      return res
        .status(400)
        .json({ success: false, message: "deadlineDate must be a valid date" });
    }
    allowedUpdates.deadlineDate = req.body.deadlineDate;
  }
  if (req.body.jobUrl !== undefined) {
    allowedUpdates.jobUrl = req.body.jobUrl;
  }
  if (req.body.platform !== undefined) {
    if(req.body.platform === null || (typeof req.body.platform === "string" && req.body.platform.length <= 100 && req.body.platform.trim().length > 0)) {
      allowedUpdates.platform = req.body.platform === null ? null : req.body.platform.trim();

    } else {
      return res
        .status(400)
        .json({ success: false, message: "platform must be a string with a maximum length of 100 characters or null" });
    }
  }
  if (req.body.priority !== undefined) {
    allowedUpdates.priority = req.body.priority;
  }

  if (!job) {
    return res.status(404).json({ success: false, message: "Job not found" });
  }
  const updatedJob = await jobStore.updateJob(
    req.params.id,
    userId,
    allowedUpdates,
  );
  res.json({ success: true, data: updatedJob });
};

const deleteJob = async (req, res) => {
  const userId = req.user.userId;
  if (isNaN(req.params.id)) {
    return res.status(400).json({ success: false, message: "Invalid job ID" });
  }
  const deletedJob = await jobStore.deleteJob(req.params.id, userId);
  if (!deletedJob) {
    return res.status(404).json({ success: false, message: "Job not found" });
  }
  res.json({ success: true, data: deletedJob });
};

module.exports = {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
};
