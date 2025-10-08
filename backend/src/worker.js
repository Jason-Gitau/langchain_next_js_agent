const { Worker } = require('bullmq');
const IORedis = require('ioredis');
const redisUrl = process.env.REDIS_URL || 'redis://redis:6379';
const connection = { connection: new IORedis(redisUrl) };

const publish = (runId, evt) => {
  const pub = new IORedis(redisUrl);
  pub.publish(`agent:${runId}`, JSON.stringify(evt));
  pub.disconnect();
};

const worker = new Worker('agent-runs', async (job) => {
  const runId = job.id;
  const { input } = job.data;

  // Example streaming simulation
  publish(runId, { type: 'start', timestamp: Date.now() });
  const steps = ['Thinking...', 'Querying vector DB...', 'Composing answer...', 'Done'];
  for (let i = 0; i < steps.length; i++) {
    await new Promise((r) => setTimeout(r, 700));
    publish(runId, { type: 'delta', index: i, text: steps[i] });
  }
  publish(runId, { type: 'done', result: { text: `Answer for input: ${input}` } });
}, connection);

worker.on('completed', (job) => console.log('job completed', job.id));
worker.on('failed', (job, err) => console.error('job failed', job.id, err));
