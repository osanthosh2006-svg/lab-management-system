const { Sample } = require('../models/Sample');
const { nextSequentialId } = require('../models/Counter');
const { asyncHandler } = require('../middleware/errorHandler');

// @route GET /api/samples?status=&type=&q=&page=&limit=
const getSamples = asyncHandler(async (req, res) => {
  const { status, type, q, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (type) filter.type = type;
  if (q) filter.$text = { $search: q };

  const skip = (Number(page) - 1) * Number(limit);
  const [samples, total] = await Promise.all([
    Sample.find(filter)
      .populate('registeredBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Sample.countDocuments(filter)
  ]);

  res.json({ data: samples, total, page: Number(page), pages: Math.ceil(total / limit) });
});

// @route GET /api/samples/:id
const getSampleById = asyncHandler(async (req, res) => {
  const sample = await Sample.findById(req.params.id).populate('registeredBy', 'name email');
  if (!sample) return res.status(404).json({ message: 'Sample not found' });
  res.json(sample);
});

// @route POST /api/samples
const createSample = asyncHandler(async (req, res) => {
  const { name, type, source, collectionDate, storageLocation, quantity, description } = req.body;

  if (!name || !type || !collectionDate) {
    return res.status(400).json({ message: 'name, type and collectionDate are required' });
  }

  const sampleId = await nextSequentialId('sample', 'SMP');

  const sample = await Sample.create({
    sampleId,
    name,
    type,
    source,
    collectionDate,
    storageLocation,
    quantity,
    description,
    registeredBy: req.user._id,
    statusHistory: [{ status: 'Registered', note: 'Sample registered into the system' }]
  });

  res.status(201).json(sample);
});

// @route PUT /api/samples/:id
const updateSample = asyncHandler(async (req, res) => {
  const sample = await Sample.findById(req.params.id);
  if (!sample) return res.status(404).json({ message: 'Sample not found' });

  const editable = ['name', 'type', 'source', 'collectionDate', 'storageLocation', 'quantity', 'description'];
  editable.forEach((field) => {
    if (req.body[field] !== undefined) sample[field] = req.body[field];
  });

  await sample.save();
  res.json(sample);
});

// @route PATCH /api/samples/:id/status
const updateSampleStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const sample = await Sample.findById(req.params.id);
  if (!sample) return res.status(404).json({ message: 'Sample not found' });

  sample.status = status;
  sample.statusHistory.push({ status, note });
  await sample.save();

  res.json(sample);
});

// @route DELETE /api/samples/:id
const deleteSample = asyncHandler(async (req, res) => {
  const sample = await Sample.findById(req.params.id);
  if (!sample) return res.status(404).json({ message: 'Sample not found' });
  await sample.deleteOne();
  res.json({ message: 'Sample deleted' });
});

module.exports = {
  getSamples,
  getSampleById,
  createSample,
  updateSample,
  updateSampleStatus,
  deleteSample
};
