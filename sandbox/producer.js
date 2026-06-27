const { myQueue } = require('./queue');

async function addJob() {
  const job = await myQueue.add('greet', { name: 'Max' });
  console.log(`Job added with id: ${job.id}`);
}

addJob();
