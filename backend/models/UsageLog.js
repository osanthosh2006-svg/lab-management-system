const mongoose = require('mongoose');

const usageLogSchema = new mongoose.Schema(
  {
    instrument: { type: mongoose.Schema.Types.ObjectId, ref: 'Instrument', required: true },
    experiment: { type: mongoose.Schema.Types.ObjectId, ref: 'Experiment' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    purpose: { type: String, trim: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date },
    notes: { type: String, trim: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('UsageLog', usageLogSchema);
