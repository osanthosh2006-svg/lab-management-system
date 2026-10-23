const PDFDocument = require('pdfkit');
const { Sample } = require('../models/Sample');
const { Experiment } = require('../models/Experiment');
const UsageLog = require('../models/UsageLog');
const { asyncHandler } = require('../middleware/errorHandler');
const { drawDocumentHeader, drawTable } = require('../utils/pdfHelpers');

const dateFilter = (from, to) => {
  const range = {};
  if (from) range.$gte = new Date(from);
  if (to) range.$lte = new Date(to);
  return Object.keys(range).length ? range : undefined;
};

// @route GET /api/reports/samples?status=&from=&to=
const generateSamplesReport = asyncHandler(async (req, res) => {
  const { status, from, to } = req.query;
  const filter = {};
  if (status) filter.status = status;
  const range = dateFilter(from, to);
  if (range) filter.collectionDate = range;

  const samples = await Sample.find(filter).populate('registeredBy', 'name').sort({ createdAt: -1 });

  const doc = new PDFDocument({ margin: 50, size: 'A4', layout: 'landscape' });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="samples-report.pdf"');
  doc.pipe(res);

  drawDocumentHeader(doc, {
    title: 'Sample Inventory Report',
    subtitle: `${samples.length} sample(s)${status ? ` — status: ${status}` : ''}${
      from || to ? ` — collected ${from || 'any'} to ${to || 'any'}` : ''
    }`,
    generatedBy: req.user?.name
  });

  drawTable(
    doc,
    [
      { header: 'Sample ID', key: 'sampleId', width: 80 },
      { header: 'Name', key: 'name', width: 130 },
      { header: 'Type', key: 'type', width: 100 },
      { header: 'Status', key: 'status', width: 90 },
      { header: 'Storage', key: 'storageLocation', width: 130 },
      { header: 'Collected', key: 'collectionDate', width: 90 },
      { header: 'Registered By', key: 'registeredBy', width: 110 }
    ],
    samples.map((s) => ({
      sampleId: s.sampleId,
      name: s.name,
      type: s.type,
      status: s.status,
      storageLocation: s.storageLocation,
      collectionDate: s.collectionDate ? s.collectionDate.toISOString().slice(0, 10) : '-',
      registeredBy: s.registeredBy?.name
    }))
  );

  doc.end();
});

// @route GET /api/reports/experiments?status=&from=&to=
const generateExperimentsReport = asyncHandler(async (req, res) => {
  const { status, from, to } = req.query;
  const filter = {};
  if (status) filter.status = status;
  const range = dateFilter(from, to);
  if (range) filter.startDate = range;

  const experiments = await Experiment.find(filter)
    .populate('assignedTo', 'name')
    .populate('samples', 'sampleId')
    .sort({ createdAt: -1 });

  const doc = new PDFDocument({ margin: 50, size: 'A4', layout: 'landscape' });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="experiments-report.pdf"');
  doc.pipe(res);

  drawDocumentHeader(doc, {
    title: 'Experiment Records Report',
    subtitle: `${experiments.length} experiment(s)${status ? ` — status: ${status}` : ''}${
      from || to ? ` — started ${from || 'any'} to ${to || 'any'}` : ''
    }`,
    generatedBy: req.user?.name
  });

  drawTable(
    doc,
    [
      { header: 'Experiment ID', key: 'experimentId', width: 90 },
      { header: 'Title', key: 'title', width: 160 },
      { header: 'Status', key: 'status', width: 90 },
      { header: 'Assigned To', key: 'assignedTo', width: 110 },
      { header: 'Samples', key: 'samples', width: 110 },
      { header: 'Start Date', key: 'startDate', width: 90 },
      { header: 'End Date', key: 'endDate', width: 90 }
    ],
    experiments.map((e) => ({
      experimentId: e.experimentId,
      title: e.title,
      status: e.status,
      assignedTo: e.assignedTo?.name,
      samples: e.samples.map((s) => s.sampleId).join(', '),
      startDate: e.startDate ? e.startDate.toISOString().slice(0, 10) : '-',
      endDate: e.endDate ? e.endDate.toISOString().slice(0, 10) : '-'
    }))
  );

  doc.end();
});

// @route GET /api/reports/instrument-usage?instrumentId=&from=&to=
const generateInstrumentUsageReport = asyncHandler(async (req, res) => {
  const { instrumentId, from, to } = req.query;
  const filter = {};
  if (instrumentId) filter.instrument = instrumentId;
  const range = dateFilter(from, to);
  if (range) filter.startTime = range;

  const logs = await UsageLog.find(filter)
    .populate('instrument', 'instrumentId name')
    .populate('user', 'name')
    .populate('experiment', 'experimentId title')
    .sort({ startTime: -1 });

  const doc = new PDFDocument({ margin: 50, size: 'A4', layout: 'landscape' });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="instrument-usage-report.pdf"');
  doc.pipe(res);

  drawDocumentHeader(doc, {
    title: 'Instrument Usage Report',
    subtitle: `${logs.length} session(s)${from || to ? ` — ${from || 'any'} to ${to || 'any'}` : ''}`,
    generatedBy: req.user?.name
  });

  drawTable(
    doc,
    [
      { header: 'Instrument', key: 'instrument', width: 130 },
      { header: 'Used By', key: 'user', width: 110 },
      { header: 'Experiment', key: 'experiment', width: 130 },
      { header: 'Purpose', key: 'purpose', width: 140 },
      { header: 'Start', key: 'startTime', width: 110 },
      { header: 'End', key: 'endTime', width: 110 }
    ],
    logs.map((l) => ({
      instrument: l.instrument ? `${l.instrument.instrumentId} ${l.instrument.name}` : '-',
      user: l.user?.name,
      experiment: l.experiment ? `${l.experiment.experimentId}` : '-',
      purpose: l.purpose,
      startTime: l.startTime ? l.startTime.toLocaleString() : '-',
      endTime: l.endTime ? l.endTime.toLocaleString() : 'Ongoing'
    }))
  );

  doc.end();
});

module.exports = { generateSamplesReport, generateExperimentsReport, generateInstrumentUsageReport };
