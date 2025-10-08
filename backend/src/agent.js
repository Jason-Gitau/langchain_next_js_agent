const express = require('express');
const { Queue } = require('bullmq');
const IORedis = require('ioredis');

const router = express.Router();
const redisUrl = process.env.REDIS_URL || 'redis://redis:6379';
const runQueue = new Queue('agent-runs', { connection: new IORedis(redisUrl) });

router.post('/run', async (req, res) => {
  const { input } = req.body;
  if (!input) return res.status(400).json({ error: 'missing input' });
  const job = await runQueue.add('run', { input });
  return res.json({ runId: job.id });
});

module.exports = router;
