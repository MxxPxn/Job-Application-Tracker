const { Queue } = require('bullmq');

const connection = { host: process.env.REDIS_HOST || 'localhost', port: 6379 };

const reportQueue = new Queue('report-generation', { connection });

module.exports = { reportQueue };