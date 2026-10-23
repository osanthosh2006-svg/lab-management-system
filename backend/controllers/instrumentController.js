const { Instrument } = require('../models/Instrument');
const { nextSequentialId } = require('../models/Counter');
const UsageLog = require('../models/UsageLog');
const { asyncHandler } = require('../middleware/errorHandler');

// @route GET /api/instruments?status=&category=&q=
const getInstruments = asyncHandler(async (req, res) => {
  const { status, category, q } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (category) filter.category = category;
  if (q) filter.name = { $regex: q, $options: 'i' };

  const instruments = await Instrument.find(filter).sort({ name: 1 });
  res.json(instruments);
});

// @route GET /api/instruments/:id
const getInstrumentById = asyncHandler(async (req, res) => {
  const instrument = await Instrument.findById(req.params.id);
  if (!instrument) return res.status(404).json({ message: 'Instrument not found' });

  const logs = await UsageLog.find({ instrument: instrument._id })
    .populate('user', 'name email')
    .populate('experiment', 'experimentId title')
    .sort({ startTime: -1 });

  res.json({ instrument, logs });
});

// @route POST /api/instruments
const createInstrument = asyncHandler(async (req, res) => {
  const { name, model, serialNumber, category, location, calibrationDate, nextCalibrationDue, notes } = req.body;

  if (!name) return res.status(400).json({ message: 'name is required' });

  const instrumentId = await nextSequentialId('instrument', 'INS');

  const instrument = await Instrument.create({
    instrumentId,
    name,
    model,
    serialNumber,
    category,
    location,
    calibrationDate,
    nextCalibrationDue,
    notes
  });

  res.status(201).json(instrument);
});

// @route PUT /api/instruments/:id
const updateInstrument = asyncHandler(async (req, res) => {
  const instrument = await Instrument.findById(req.params.id);
  if (!instrument) return res.status(404).json({ message: 'Instrument not found' });

  const editable = [
    'name', 'model', 'serialNumber', 'category', 'location',
    'status', 'calibrationDate', 'nextCalibrationDue', 'notes'
  ];
  editable.forEach((field) => {
    if (req.body[field] !== undefined) instrument[field] = req.body[field];
  });

  await instrument.save();
  res.json(instrument);
});

// @route DELETE /api/instruments/:id
const deleteInstrument = asyncHandler(async (req, res) => {
  const instrument = await Instrument.findById(req.params.id);
  if (!instrument) return res.status(404).json({ message: 'Instrument not found' });
  await instrument.deleteOne();
  res.json({ message: 'Instrument deleted' });
});

// @route POST /api/instruments/:id/usage/start
const startUsage = asyncHandler(async (req, res) => {
  const instrument = await Instrument.findById(req.params.id);
  if (!instrument) return res.status(404).json({ message: 'Instrument not found' });

  if (instrument.status === 'In Use') {
    return res.status(409).json({ message: 'Instrument is already in use' });
  }
  if (instrument.status === 'Under Maintenance' || instrument.status === 'Out of Service') {
    return res.status(409).json({ message: `Instrument is ${instrument.status.toLowerCase()}` });
  }

  const { experiment, purpose, notes } = req.body;

  const log = await UsageLog.create({
    instrument: instrument._id,
    experiment: experiment || undefined,
    user: req.user._id,
    purpose,
    notes,
    startTime: new Date()
  });

  instrument.status = 'In Use';
  await instrument.save();

  res.status(201).json(log);
});

// @route POST /api/instruments/:id/usage/:logId/end
const endUsage = asyncHandler(async (req, res) => {
  const log = await UsageLog.findById(req.params.logId);
  if (!log) return res.status(404).json({ message: 'Usage log not found' });
  if (log.endTime) return res.status(409).json({ message: 'This usage session already ended' });

  log.endTime = new Date();
  if (req.body.notes) log.notes = `${log.notes ? log.notes + ' | ' : ''}${req.body.notes}`;
  await log.save();

  const instrument = await Instrument.findById(req.params.id);
  if (instrument && instrument.status === 'In Use') {
    instrument.status = 'Available';
    await instrument.save();
  }

  res.json(log);
});

module.exports = {
  getInstruments,
  getInstrumentById,
  createInstrument,
  updateInstrument,
  deleteInstrument,
  startUsage,
  endUsage
};
