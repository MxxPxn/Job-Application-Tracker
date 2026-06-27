const { Worker } = require('bullmq');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const db = require('../db/connection');

const connection = { host: process.env.REDIS_HOST || 'localhost', port: 6379 };

const REPORTS_DIR = path.join(__dirname, '../../reports');
if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });

const worker = new Worker('report-generation', async (job) => {
  const { userId } = job.data;

  const { rows: applications } = await db.query(
    'SELECT company, position, status, applied_date FROM jobs WHERE user_id = $1 ORDER BY applied_date DESC',
    [userId]
  );

  const filePath = path.join(REPORTS_DIR, `report-${job.id}.pdf`);
  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream(filePath));

  doc.fontSize(18).text('Job Application Report', { align: 'center' });
  doc.moveDown();

  applications.forEach((app) => {
    doc.fontSize(12).text(`${app.company} — ${app.position}`);
    doc.fontSize(10).text(`Status: ${app.status} | Applied: ${app.applied_date}`);
    doc.moveDown();
  });

  doc.end();

  return { filePath: `report-${job.id}.pdf` };
}, { connection });

worker.on('completed', (job, result) => {
  console.log(`Report ${job.id} generated:`, result.filePath);
});

worker.on('failed', (job, err) => {
  console.error(`Report ${job.id} failed:`, err.message);
});