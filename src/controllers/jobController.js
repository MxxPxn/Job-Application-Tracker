const jobStore = require('../data/jobStore');

const VALID_STATUSES = ['applied', 'interview', 'offer', 'rejected'];

const createJob = async (req, res) => {
    const {company, position, status, appliedDate, notes} = req.body;

    const errors = [];
    if (!company || typeof company !== 'string') {
      errors.push('company is required and must be a string');
    }
    if (!position || typeof position !== 'string') {
      errors.push('position is required and must be a string');
    }
    if (!status || !VALID_STATUSES.includes(status)) {
      errors.push(`status must be one of: ${VALID_STATUSES.join(', ')}`);
    }
    if (!appliedDate || isNaN(Date.parse(appliedDate))) {
      errors.push('appliedDate is required and must be a valid date');
    }
    if (errors.length > 0) {
        return res.status(400).json({ success: false, errors });
    }

    const job = await jobStore.addJob({
        company: company.trim(),
        position: position.trim(),
        status,
        appliedDate,
        notes: notes ? notes.trim() : '',
        user_id: req.user.userId
    });
    res.status(201).json({ success: true, data: job });
};

const getJobs = async (req, res) => {
    const jobs = await jobStore.getAllJobs();
    res.json({ success: true, data: jobs });
};

const getJobById = async (req, res) => {
    if (isNaN(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid job ID' });
    }
    const job = await jobStore.getJobById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    return res.json({ success: true, data: job });
};

const updateJob = async (req, res) => {
    if (isNaN(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid job ID' });
    }
    const job = await jobStore.getJobById(req.params.id);
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
        return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` });
      }
    }
    if (req.body.appliedDate !== undefined) {
      if (!isNaN(Date.parse(req.body.appliedDate))) {
        allowedUpdates.appliedDate = req.body.appliedDate;
      } else {
        return res.status(400).json({ success: false, message: 'appliedDate must be a valid date' });
      }
    }
    if (req.body.notes !== undefined) {
      allowedUpdates.notes = req.body.notes;
    }

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    const updatedJob = await jobStore.updateJob(req.params.id, allowedUpdates);
    res.json({ success: true, data: updatedJob });
};

const deleteJob = async (req, res) => {
    if (isNaN(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid job ID' });
    }
    const deletedJob = await jobStore.deleteJob(req.params.id);
    if (!deletedJob) {
      return res.status(404).json({ success: false, message: 'Job not found' });
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
