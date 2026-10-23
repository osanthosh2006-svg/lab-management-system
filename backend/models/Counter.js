const mongoose = require('mongoose');

// Generic counter collection used to mint sequential, human-readable
// identifiers (SMP-000001, EXP-000001, INS-000001) without relying on
// Mongo's ObjectId. One document per prefix/key.
const counterSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  seq: { type: Number, default: 0 }
});

const Counter = mongoose.model('Counter', counterSchema);

/**
 * Atomically increments and returns the next sequence number for a key,
 * then formats it as PREFIX-000001.
 */
async function nextSequentialId(key, prefix, padLength = 6) {
  const doc = await Counter.findOneAndUpdate(
    { key },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return `${prefix}-${String(doc.seq).padStart(padLength, '0')}`;
}

module.exports = { Counter, nextSequentialId };
