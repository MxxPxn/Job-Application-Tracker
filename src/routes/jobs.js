const express = require('express');
const router = express.Router();
const jobsController = require('../controllers/jobController');

router.post('/', jobsController.createJob);

module.exports = router;