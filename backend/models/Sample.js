const mongoose = require('mongoose');

// Lifecycle a physical sample moves through from intake to disposal.
const SAMPLE_STATUSES = [
  'Registered',
  'In Storage',
  'In Use',
  'Analyzed',
  'Archived',
  'Disposed'
];

const sampleSchema = new mongoose.Schema(
  {
    sampleId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, required: true, trim: true }, // e.g. Blood, Soil, Tissue, Chemical Compound
    source: { type: String, trim: true }, // e.g. donor id, field site, supplier
    collectionDate: { type: Date, required: true },
    status: { type: String, enum: SAMPLE_STATUSES, default: 'Registered' },
    storageLocation: { type: String, trim: true }, // e.g. Freezer-2/Shelf-B/Box-14
    quantity: { type: String, trim: true }, // e.g. "5 mL", "10 g"
    description: { type: String, trim: true },
    statusHistory: [
      {
        status: { type: String, enum: SAMPLE_STATUSES },
        changedAt: { type: Date, default: Date.now },
        note: String
      }
    ],
    registeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

sampleSchema.index({ name: 'text', type: 'text', source: 'text' });

module.exports = { Sample: mongoose.model('Sample', sampleSchema), SAMPLE_STATUSES };
