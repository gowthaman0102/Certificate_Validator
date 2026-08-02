require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDB } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const universityRoutes = require('./routes/universityRoutes');
const certificateRoutes = require('./routes/certificateRoutes');
const verificationRoutes = require('./routes/verificationRoutes');
const revocationRoutes = require('./routes/revocationRoutes');
const walletRoutes = require('./routes/walletRoutes');
const auditRoutes      = require('./routes/auditRoutes');
const analyticsRoutes  = require('./routes/analyticsRoutes');
const blockchainRoutes = require('./routes/blockchainRoutes');
const fraudRoutes      = require('./routes/fraudRoutes');
const chatRoutes       = require('./routes/chatAssistantRoutes');
const passportRoutes   = require('./routes/passportRoutes');
const templateRoutes   = require('./routes/templateRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

initDB();

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Public endpoint — returns the active AI provider label for UI badges.
// No auth required; value is derived from AI_PROVIDER env var (not sensitive).
const AI_PROVIDER_META = {
  openai:    { label: 'OpenAI GPT-4',     description: 'Live responses via OpenAI API' },
  gemini:    { label: 'Google Gemini',    description: 'Live responses via Gemini API' },
  claude:    { label: 'Anthropic Claude', description: 'Live responses via Claude API' },
  azure:     { label: 'Azure OpenAI',     description: 'Live responses via Azure OpenAI' },
  local:     { label: 'Local LLM',        description: 'Responses from a self-hosted model' },
  heuristic: { label: 'Heuristic Engine', description: 'Offline rule-based AI engine — no API key required. Set AI_PROVIDER in .env to enable a live LLM.' },
  none:      { label: 'Heuristic Engine', description: 'Offline rule-based AI engine — no API key required.' },
};
app.get('/api/ai/provider', (req, res) => {
  const key = (process.env.AI_PROVIDER || 'heuristic').toLowerCase();
  const meta = AI_PROVIDER_META[key] || AI_PROVIDER_META.heuristic;
  res.json({ provider: key, ...meta });
});

app.use('/api', authRoutes);
app.use('/api', universityRoutes);
app.use('/api', certificateRoutes);
app.use('/api', verificationRoutes);
app.use('/api', revocationRoutes);
app.use('/api', walletRoutes);
app.use('/api', auditRoutes);
app.use('/api', analyticsRoutes);
app.use('/api', blockchainRoutes);
app.use('/api', fraudRoutes);
app.use('/api', chatRoutes);
app.use('/api/passport', passportRoutes);
app.use('/api/templates', templateRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
