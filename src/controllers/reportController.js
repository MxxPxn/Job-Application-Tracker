const { reportQueue } = require('../queues/reportQueue');
const path = require('path');
const fs = require('fs');

// POST /api/reports
async function createReport(req, res) {
  try {
    const userId = req.user.userId;
    const job = await reportQueue.add('generate-report', { userId });
    res.status(202).json({ jobId: job.id, status: 'queued' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to queue report' });
  }
}

// GET /api/reports/:jobId
async function getReportStatus(req, res) {
  try {
    const { jobId } = req.params;
    const job = await reportQueue.getJob(jobId);

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const state = await job.getState(); // 'waiting' | 'active' | 'completed' | 'failed'

    if (state === 'completed') {
      const result = job.returnvalue;
      return res.json({ status: 'completed', downloadUrl: `/api/reports/${jobId}/download` });
    }

    if (state === 'failed') {
      return res.json({ status: 'failed', reason: job.failedReason });
    }

    res.json({ status: state });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get report status' });
  }
}

// GET /api/reports/:jobId/download
async function downloadReport(req, res) {
  try {
    const { jobId } = req.params;
    const job = await reportQueue.getJob(jobId);

    if (!job || (await job.getState()) !== 'completed') {
      return res.status(404).json({ error: 'Report not ready' });
    }

    const filePath = path.join(__dirname, '../../reports', job.returnvalue.filePath);
    res.download(filePath);
  } catch (err) {
    res.status(500).json({ error: 'Failed to download report' });
  }
}

module.exports = { createReport, getReportStatus, downloadReport };