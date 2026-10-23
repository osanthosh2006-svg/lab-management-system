const { Sample } = require('../models/Sample');
const { Experiment } = require('../models/Experiment');
const { Instrument } = require('../models/Instrument');
const UsageLog = require('../models/UsageLog');
const { asyncHandler } = require('../middleware/errorHandler');

// @route GET /api/dashboard/summary
const getSummary = asyncHandler(async (req, res) => {
  const [
    totalSamples,
    samplesByStatus,
    totalExperiments,
    experimentsByStatus,
    totalInstruments,
    instrumentsByStatus,
    activeUsageCount,
    recentSamples,
    recentExperiments
  ] = await Promise.all([
    Sample.countDocuments(),
    Sample.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Experiment.countDocuments(),
    Experiment.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Instrument.countDocuments(),
    Instrument.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    UsageLog.countDocuments({ endTime: { $exists: false } }),
    Sample.find().sort({ createdAt: -1 }).limit(5).select('sampleId name type status createdAt'),
    Experiment.find().sort({ createdAt: -1 }).limit(5).select('experimentId title status startDate')
  ]);

  const toMap = (arr) => arr.reduce((acc, { _id, count }) => ({ ...acc, [_id]: count }), {});

  res.json({
    totals: {
      samples: totalSamples,
      experiments: totalExperiments,
      instruments: totalInstruments,
      activeInstrumentSessions: activeUsageCount
    },
    samplesByStatus: toMap(samplesByStatus),
    experimentsByStatus: toMap(experimentsByStatus),
    instrumentsByStatus: toMap(instrumentsByStatus),
    recentSamples,
    recentExperiments
  });
});

module.exports = { getSummary };
