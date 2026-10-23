const express = require('express');
const {
  generateSamplesReport,
  generateExperimentsReport,
  generateInstrumentUsageReport
} = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/samples', generateSamplesReport);
router.get('/experiments', generateExperimentsReport);
router.get('/instrument-usage', generateInstrumentUsageReport);

module.exports = router;
