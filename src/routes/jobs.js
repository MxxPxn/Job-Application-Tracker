const { asyncHandler, verifyToken } = require ('../middleware/errorHandler');

const express = require('express');
const router = express.Router();
const jobsController = require('../controllers/jobController');
router.use(verifyToken);
router.post('/', asyncHandler(jobsController.createJob));
router.get('/', asyncHandler(jobsController.getJobs));
router.get('/:id', asyncHandler(jobsController.getJobById));
router.put('/:id', asyncHandler(jobsController.updateJob));
router.delete('/:id', asyncHandler(jobsController.deleteJob));

module.exports = router;