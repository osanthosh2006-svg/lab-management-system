const mongoose = require('mongoose');

const EXPERIMENT_STATUSES = ['Planned', 'In Progress', 'Completed', 'Cancelled'];

const experimentSchema = new mongoose.Schema(
  {
    experimentId: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    objective: { type: String, trim: true },
    protocol: { type: String, trim: true }, // methodology / steps followed
    status: { type: String, enum: EXPERIMENT_STATUSES, default: 'Planned' },
    samples: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Sample' }],
    instrumentsUsed: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Instrument' }],
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    results: { type: String, trim: true },
    notes: { type: String, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

experimentSchema.index({ title: 'text', objective: 'text' });

module.exports = { Experiment: mongoose.model('Experiment', experimentSchema), EXPERIMENT_STATUSES };
