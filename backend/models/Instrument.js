const mongoose = require('mongoose');

const INSTRUMENT_STATUSES = ['Available', 'In Use', 'Under Maintenance', 'Out of Service'];

const instrumentSchema = new mongoose.Schema(
  {
    instrumentId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true }, // e.g. Centrifuge, PCR Machine
    model: { type: String, trim: true },
    serialNumber: { type: String, trim: true },
    category: { type: String, trim: true }, // e.g. Analytical, Imaging, Prep
    location: { type: String, trim: true },
    status: { type: String, enum: INSTRUMENT_STATUSES, default: 'Available' },
    calibrationDate: { type: Date },
    nextCalibrationDue: { type: Date },
    notes: { type: String, trim: true }
  },
  { timestamps: true }
);

module.exports = { Instrument: mongoose.model('Instrument', instrumentSchema), INSTRUMENT_STATUSES };
