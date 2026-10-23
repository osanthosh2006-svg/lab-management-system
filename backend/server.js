require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const sampleRoutes = require('./routes/sampleRoutes');
const experimentRoutes = require('./routes/experimentRoutes');
const instrumentRoutes = require('./routes/instrumentRoutes');
const reportRoutes = require('./routes/reportRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'labtrack-backend' }));

app.use('/api/auth', authRoutes);
app.use('/api/samples', sampleRoutes);
app.use('/api/experiments', experimentRoutes);
app.use('/api/instruments', instrumentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  app.listen(PORT, () => console.log(`[server] LabTrack API listening on port ${PORT}`));
};

if (require.main === module) {
  start().catch((err) => {
    console.error('[server] startup failed:', err.message);
    process.exitCode = 1;
  });
}

module.exports = app;
