const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'missing text' });
  // TODO: Port the LangChain ingestion logic here (split, embed, upload to vectorstore)
  return res.json({ ok: true, ingestedCount: 1 });
});

module.exports = router;
