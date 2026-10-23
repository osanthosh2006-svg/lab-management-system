// Populates the database with a small demo dataset so the app can be
// explored immediately after setup. Safe to re-run: it wipes the
// collections it manages first.
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const User = require('../models/User');
const { Sample } = require('../models/Sample');
const { Experiment } = require('../models/Experiment');
const { Instrument } = require('../models/Instrument');
const UsageLog = require('../models/UsageLog');
const { Counter, nextSequentialId } = require('../models/Counter');

const run = async () => {
  await connectDB();

  console.log('[seed] clearing existing demo collections...');
  await Promise.all([
    User.deleteMany({}),
    Sample.deleteMany({}),
    Experiment.deleteMany({}),
    Instrument.deleteMany({}),
    UsageLog.deleteMany({}),
    Counter.deleteMany({})
  ]);

  console.log('[seed] creating users...');
  const admin = await User.create({
    name: 'Dr. Ananya Rao',
    email: 'admin@labtrack.io',
    password: 'admin123',
    role: 'admin',
    department: 'Lab Administration'
  });

  const researcher = await User.create({
    name: 'Karthik Subramaniam',
    email: 'researcher@labtrack.io',
    password: 'research123',
    role: 'researcher',
    department: 'Molecular Biology'
  });

  console.log('[seed] creating instruments...');
  const instrumentDefs = [
    { name: 'Refrigerated Centrifuge', model: 'CF-5000', category: 'Preparation', location: 'Bench 3' },
    { name: 'PCR Thermal Cycler', model: 'TC-2400', category: 'Amplification', location: 'Bench 1' },
    { name: 'UV-Vis Spectrophotometer', model: 'SP-800', category: 'Analytical', location: 'Bench 5' },
    { name: 'Analytical Balance', model: 'AB-220', category: 'Measurement', location: 'Bench 2' }
  ];
  const instruments = [];
  for (const def of instrumentDefs) {
    const instrumentId = await nextSequentialId('instrument', 'INS');
    instruments.push(
      await Instrument.create({
        ...def,
        instrumentId,
        serialNumber: `SN-${Math.floor(100000 + Math.random() * 900000)}`,
        calibrationDate: new Date('2026-04-01'),
        nextCalibrationDue: new Date('2026-10-01')
      })
    );
  }

  console.log('[seed] creating samples...');
  const sampleDefs = [
    { name: 'Plasma Sample A1', type: 'Blood Plasma', source: 'Donor-014', storageLocation: 'Freezer-2/Shelf-B', quantity: '5 mL' },
    { name: 'Soil Core S-12', type: 'Soil', source: 'Field Site 3', storageLocation: 'Shelf-C/Box-4', quantity: '250 g' },
    { name: 'Tissue Biopsy T-07', type: 'Tissue', source: 'Specimen-221', storageLocation: 'Freezer-1/Shelf-A', quantity: '2 g' },
    { name: 'Compound X Batch 9', type: 'Chemical Compound', source: 'Synthesis Lab', storageLocation: 'Cabinet-4/Drawer-2', quantity: '50 mL' },
    { name: 'Water Sample W-33', type: 'Water', source: 'River Site 2', storageLocation: 'Cold Room/Rack-1', quantity: '1 L' }
  ];
  const samples = [];
  for (const def of sampleDefs) {
    const sampleId = await nextSequentialId('sample', 'SMP');
    samples.push(
      await Sample.create({
        ...def,
        sampleId,
        collectionDate: new Date('2026-08-01'),
        registeredBy: researcher._id,
        statusHistory: [{ status: 'Registered', note: 'Sample registered into the system' }]
      })
    );
  }

  console.log('[seed] creating experiments...');
  const experimentId1 = await nextSequentialId('experiment', 'EXP');
  const exp1 = await Experiment.create({
    experimentId: experimentId1,
    title: 'Plasma Protein Quantification',
    objective: 'Quantify total protein concentration across plasma samples using UV-Vis absorbance.',
    protocol: 'Bradford assay followed by UV-Vis spectrophotometry at 595nm.',
    status: 'In Progress',
    samples: [samples[0]._id],
    instrumentsUsed: [instruments[2]._id],
    assignedTo: researcher._id,
    startDate: new Date('2026-08-05'),
    createdBy: researcher._id
  });

  const experimentId2 = await nextSequentialId('experiment', 'EXP');
  const exp2 = await Experiment.create({
    experimentId: experimentId2,
    title: 'Soil Microbial DNA Amplification',
    objective: 'Amplify target 16S rRNA gene region from soil-extracted DNA.',
    protocol: 'Standard PCR protocol, 35 cycles, annealing at 58C.',
    status: 'Completed',
    samples: [samples[1]._id],
    instrumentsUsed: [instruments[1]._id, instruments[0]._id],
    assignedTo: researcher._id,
    startDate: new Date('2026-07-20'),
    endDate: new Date('2026-07-22'),
    results: 'Successful amplification observed at expected band size (~1500bp) via gel confirmation.',
    createdBy: admin._id
  });

  await Sample.updateMany(
    { _id: { $in: [samples[0]._id, samples[1]._id] } },
    { $set: { status: 'In Use' }, $push: { statusHistory: { status: 'In Use', note: 'Linked to active experiment' } } }
  );

  console.log('[seed] creating usage logs...');
  await UsageLog.create({
    instrument: instruments[2]._id,
    experiment: exp1._id,
    user: researcher._id,
    purpose: 'Absorbance reading for protein quantification',
    startTime: new Date('2026-08-05T10:00:00'),
    endTime: new Date('2026-08-05T10:45:00'),
    notes: 'Ran triplicate readings.'
  });
  await UsageLog.create({
    instrument: instruments[1]._id,
    experiment: exp2._id,
    user: researcher._id,
    purpose: '16S rRNA amplification run',
    startTime: new Date('2026-07-20T09:00:00'),
    endTime: new Date('2026-07-20T12:30:00')
  });

  console.log('\n[seed] done! Demo accounts:');
  console.log('  admin@labtrack.io / admin123 (role: admin)');
  console.log('  researcher@labtrack.io / research123 (role: researcher)\n');

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error('[seed] failed:', err);
  process.exit(1);
});
