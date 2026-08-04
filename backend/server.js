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
const chatRoutes       = require('./routes/chatAssistantRoutes');
const passportRoutes   = require('./routes/passportRoutes');
const templateRoutes   = require('./routes/templateRoutes');
const disclosureRoutes = require('./routes/disclosureRoutes');
const goalRoutes       = require('./routes/goalRoutes');

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://certificate-validator-yvak.onrender.com',
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true,
}));
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

// Public aggregate stats summary endpoint for Home page
app.get('/api/stats/summary', (req, res) => {
  try {
    const certsCount = db.prepare("SELECT COUNT(*) as count FROM certificates WHERE status != 'REVOKED'").get()?.count || 0;
    const uniCount   = db.prepare("SELECT COUNT(*) as count FROM universities").get()?.count || 0;
    const verifCount = db.prepare("SELECT COUNT(*) as count FROM verification_events").get()?.count || 0;
    const walletVerifCount = db.prepare("SELECT COUNT(*) as count FROM wallet_events WHERE event_type = 'VERIFY'").get()?.count || 0;

    res.json({
      certificates_issued: certsCount,
      institutions_onboarded: uniCount,
      verifications_performed: verifCount + walletVerifCount,
    });
  } catch (err) {
    console.error('Error fetching stats summary:', err);
    res.json({
      certificates_issued: 0,
      institutions_onboarded: 0,
      verifications_performed: 0,
    });
  }
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
app.use('/api', chatRoutes);
app.use('/api/passport', passportRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api', disclosureRoutes);
app.use('/api/goals', goalRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
