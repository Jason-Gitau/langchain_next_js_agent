const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Example health
app.get('/health', (req, res) => res.json({ ok: true }));

// Example ingest endpoint (move logic from app/api/retrieval/ingest/route.ts)
app.post('/ingest', async (req, res) => {
  const { text } = req.body;
  // TODO: copy over the LangChain/Supabase ingestion logic here
  if (!text) return res.status(400).json({ error: 'missing text' });
  try {
    // placeholder: pretend we ingested
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// Example agent execution endpoint
app.post('/agent/run', async (req, res) => {
  const { input } = req.body;
  if (!input) return res.status(400).json({ error: 'missing input' });
  // TODO: implement agent execution using LangChain runtime (streaming optional)
  return res.json({ result: `received: ${input}` });
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`backend listening ${port}`));
