const { Queue } = require('bullmq');

const connection = { host: 'localhost', port: 6379 };

const myQueue = new Queue('test-queue', { connection });

module.exports = { myQueue };
