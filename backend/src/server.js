const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const IORedis = require('ioredis');
const { Queue } = require('bullmq');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.json());

const server = http.createServer(app);

const io = new Server(server, { cors: { origin: true, methods: ['GET', 'POST'] } });

// Redis connections
const redisUrl = process.env.REDIS_URL || 'redis://redis:6379';
const pubClient = new IORedis(redisUrl);
const subClient = pubClient.duplicate();

// socket.io redis adapter
const { createAdapter } = require('@socket.io/redis-adapter');
io.adapter(createAdapter(pubClient, subClient));

// Queue for agent runs
const connection = { connection: new IORedis(redisUrl) };
const runQueue = new Queue('agent-runs', { connection: new IORedis(redisUrl) });

// Simple health
app.get('/health', (req, res) => res.json({ ok: true }));

// Ingest endpoint (simple proxy for demo)
const ingestRouter = require('./ingest');
const agentRouter = require('./agent');

app.use('/ingest', ingestRouter);
app.use('/agent', agentRouter);

// Socket auth middleware (placeholder)
io.use((socket, next) => {
  // token validation would go here
  socket.user = { id: socket.handshake.query.userId || 'anon' };
  next();
});

io.on('connection', (socket) => {
  console.log('socket connected', socket.id, 'user', socket.user.id);
  socket.on('join', ({ room }) => {
    socket.join(room);
  });
  socket.on('disconnect', () => {
    console.log('socket disconnected', socket.id);
  });
});

// Subscribe to Redis pubsub for agent events
const sub = new IORedis(redisUrl);
sub.psubscribe('agent:*', (err, count) => {
  if (err) console.error('psubscribe error', err);
});
sub.on('pmessage', (pattern, channel, message) => {
  try {
    const [, runId] = channel.split(':');
    const payload = JSON.parse(message);
    io.to(runId).emit('agent:event', payload);
  } catch (e) {
    console.error('error parsing pubsub message', e);
  }
});

const port = process.env.PORT || 4000;
server.listen(port, () => console.log(`backend server listening on ${port}`));
