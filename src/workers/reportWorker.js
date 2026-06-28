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
    'SELECT company, position, status, applied_date, salary, location, notes FROM jobs WHERE user_id = $1 ORDER BY applied_date DESC',
    [userId]
  );

  const filePath = path.join(REPORTS_DIR, `report-${job.id}.pdf`);
  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream(filePath));

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-US', { timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric' });

  const generatedAt = new Date().toLocaleString('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  // Header
  doc.fontSize(20).font('Helvetica-Bold').text('Job Application Report', { align: 'center' });
  doc.fontSize(10).font('Helvetica').fillColor('gray').text(`Generated: ${generatedAt}`, { align: 'center' });
  doc.fillColor('black').moveDown();

  // Summary stats
  const total = applications.length;
  const byStatus = applications.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {});

  doc.fontSize(13).font('Helvetica-Bold').text('Summary');
  doc.moveTo(doc.page.margins.left, doc.y).lineTo(doc.page.width - doc.page.margins.right, doc.y).stroke();
  doc.moveDown(0.4);
  doc.fontSize(10).font('Helvetica').text(`Total applications: ${total}`);
  Object.entries(byStatus).forEach(([status, count]) => {
    doc.text(`  ${status.charAt(0).toUpperCase() + status.slice(1)}: ${count}`);
  });
  doc.moveDown();

  // Applications list
  doc.fontSize(13).font('Helvetica-Bold').text('Applications');
  doc.moveTo(doc.page.margins.left, doc.y).lineTo(doc.page.width - doc.page.margins.right, doc.y).stroke();
  doc.moveDown(0.4);

  applications.forEach((app) => {
    doc.fontSize(12).font('Helvetica-Bold').text(`${app.company} — ${app.position}`);
    doc.fontSize(10).font('Helvetica')
      .text(`Status: ${app.status}  |  Applied: ${formatDate(app.applied_date)}${app.location ? `  |  Location: ${app.location}` : ''}${app.salary ? `  |  Salary: ${app.salary}` : ''}`);
    if (app.notes) {
      doc.fontSize(9).fillColor('gray').text(`Notes: ${app.notes}`).fillColor('black');
    }
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