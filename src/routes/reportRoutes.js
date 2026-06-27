const express = require('express');
const router = express.Router();
const { createReport, getReportStatus, downloadReport } = require('../controllers/reportController');
const { verifyToken } = require('../middleware/errorHandler');

router.post('/', verifyToken, createReport);
router.get('/:jobId', verifyToken, getReportStatus);
router.get('/:jobId/download', verifyToken, downloadReport);

module.exports = router;