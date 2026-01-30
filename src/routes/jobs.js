const express = require('express');
const router = express.Router();
const jobsController = require('../controllers/jobController');

router.post('/', jobsController.createJob);
router.get('/', jobsController.getJobs);
router.get('/:id', jobsController.getJobById);
router.put('/:id', jobsController.updateJob);
router.delete('/:id', jobsController.deleteJob);

module.exports = router;