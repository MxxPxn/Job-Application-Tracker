const { Worker } = require('bullmq');

const connection = { host: 'localhost', port: 6379 };

const worker = new Worker('test-queue', async (job) => {
  console.log(`Processing job ${job.id}, data:`, job.data);
  await new Promise((resolve) => setTimeout(resolve, 10000));
  console.log(`Finished job ${job.id}`);
}, { connection });

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});
