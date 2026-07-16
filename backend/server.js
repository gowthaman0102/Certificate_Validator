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

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

initDB();

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.use('/api', authRoutes);
app.use('/api', universityRoutes);
app.use('/api', certificateRoutes);
app.use('/api', verificationRoutes);
app.use('/api', revocationRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
