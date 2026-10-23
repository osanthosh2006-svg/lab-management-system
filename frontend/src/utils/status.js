// Maps every lifecycle status used across samples, experiments and
// instruments to one of four semantic tones. Centralising this means a
// status always reads the same way wherever it appears in the app.
const TONE_MAP = {
  // Sample lifecycle
  Registered: 'neutral',
  'In Storage': 'info',
  'In Use': 'attention',
  Analyzed: 'positive',
  Archived: 'neutral',
  Disposed: 'critical',
  // Experiment lifecycle
  Planned: 'neutral',
  'In Progress': 'attention',
  Completed: 'positive',
  Cancelled: 'critical',
  // Instrument lifecycle
  Available: 'positive',
  'Under Maintenance': 'attention',
  'Out of Service': 'critical'
};

export const toneOf = (status) => TONE_MAP[status] || 'neutral';

export const TONE_CLASSES = {
  neutral: { dot: 'bg-muted', text: 'text-muted' },
  info: { dot: 'bg-teal', text: 'text-teal-dark' },
  attention: { dot: 'bg-amber', text: 'text-amber' },
  positive: { dot: 'bg-teal', text: 'text-teal-dark' },
  critical: { dot: 'bg-rust', text: 'text-rust' }
};
