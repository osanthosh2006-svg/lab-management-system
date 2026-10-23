const { Experiment } = require('../models/Experiment');
const { Sample } = require('../models/Sample');
const { nextSequentialId } = require('../models/Counter');
const { asyncHandler } = require('../middleware/errorHandler');

const POPULATE = [
  { path: 'samples', select: 'sampleId name type status' },
  { path: 'instrumentsUsed', select: 'instrumentId name status' },
  { path: 'assignedTo', select: 'name email' },
  { path: 'createdBy', select: 'name email' }
];

// @route GET /api/experiments?status=&q=&page=&limit=
const getExperiments = asyncHandler(async (req, res) => {
  const { status, q, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (q) filter.$text = { $search: q };

  const skip = (Number(page) - 1) * Number(limit);
  const [experiments, total] = await Promise.all([
    Experiment.find(filter).populate(POPULATE).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Experiment.countDocuments(filter)
  ]);

  res.json({ data: experiments, total, page: Number(page), pages: Math.ceil(total / limit) });
});

// @route GET /api/experiments/:id
const getExperimentById = asyncHandler(async (req, res) => {
  const experiment = await Experiment.findById(req.params.id).populate(POPULATE);
  if (!experiment) return res.status(404).json({ message: 'Experiment not found' });
  res.json(experiment);
});

// @route POST /api/experiments
const createExperiment = asyncHandler(async (req, res) => {
  const { title, objective, protocol, samples, instrumentsUsed, assignedTo, startDate } = req.body;

  if (!title || !startDate) {
    return res.status(400).json({ message: 'title and startDate are required' });
  }

  const experimentId = await nextSequentialId('experiment', 'EXP');

  const experiment = await Experiment.create({
    experimentId,
    title,
    objective,
    protocol,
    samples: samples || [],
    instrumentsUsed: instrumentsUsed || [],
    assignedTo: assignedTo || req.user._id,
    startDate,
    createdBy: req.user._id
  });

  // Move linked samples into "In Use" to reflect they are now part of an active experiment
  if (samples && samples.length) {
    await Sample.updateMany(
      { _id: { $in: samples }, status: { $in: ['Registered', 'In Storage'] } },
      {
        $set: { status: 'In Use' },
        $push: { statusHistory: { status: 'In Use', note: `Linked to experiment ${experimentId}` } }
      }
    );
  }

  const populated = await experiment.populate(POPULATE);
  res.status(201).json(populated);
});

// @route PUT /api/experiments/:id
const updateExperiment = asyncHandler(async (req, res) => {
  const experiment = await Experiment.findById(req.params.id);
  if (!experiment) return res.status(404).json({ message: 'Experiment not found' });

  const editable = [
    'title', 'objective', 'protocol', 'samples', 'instrumentsUsed',
    'assignedTo', 'startDate', 'endDate', 'results', 'notes', 'status'
  ];
  editable.forEach((field) => {
    if (req.body[field] !== undefined) experiment[field] = req.body[field];
  });

  await experiment.save();
  const populated = await experiment.populate(POPULATE);
  res.json(populated);
});

// @route DELETE /api/experiments/:id
const deleteExperiment = asyncHandler(async (req, res) => {
  const experiment = await Experiment.findById(req.params.id);
  if (!experiment) return res.status(404).json({ message: 'Experiment not found' });
  await experiment.deleteOne();
  res.json({ message: 'Experiment deleted' });
});

module.exports = {
  getExperiments,
  getExperimentById,
  createExperiment,
  updateExperiment,
  deleteExperiment
};
