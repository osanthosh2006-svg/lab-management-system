import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import api from '../api/axios';

const SAMPLE_STATUSES = ['Registered', 'In Storage', 'In Use', 'Analyzed', 'Archived', 'Disposed'];
const EXPERIMENT_STATUSES = ['Planned', 'In Progress', 'Completed', 'Cancelled'];

async function downloadReport(url, params, filename) {
  const response = await api.get(url, { params, responseType: 'blob' });
  const blobUrl = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
}

export default function Reports() {
  const [instruments, setInstruments] = useState([]);
  const [sampleFilters, setSampleFilters] = useState({ status: '', from: '', to: '' });
  const [expFilters, setExpFilters] = useState({ status: '', from: '', to: '' });
  const [usageFilters, setUsageFilters] = useState({ instrumentId: '', from: '', to: '' });
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/instruments').then(({ data }) => setInstruments(data)).catch(() => {});
  }, []);

  const handleDownload = async (key, url, params, filename) => {
    setBusy(key);
    setError('');
    try {
      await downloadReport(url, params, filename);
    } catch (err) {
      setError('Failed to generate report. Make sure there is matching data.');
    } finally {
      setBusy('');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-ink">Reports</h1>
        <p className="mt-1 text-sm text-muted">Generate PDF reports for audits, handovers, or lab reviews.</p>
      </div>

      {error && <div className="rounded-sm border border-rust/30 bg-rust-light px-4 py-3 text-sm text-rust">{error}</div>}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="panel p-5">
          <h2 className="text-sm font-medium text-ink">Sample inventory</h2>
          <p className="mt-1 text-xs text-muted">All registered samples matching the filters below.</p>
          <div className="mt-4 space-y-3">
            <div>
              <label className="field-label">Status</label>
              <select className="field-input" value={sampleFilters.status} onChange={(e) => setSampleFilters({ ...sampleFilters, status: e.target.value })}>
                <option value="">Any status</option>
                {SAMPLE_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="field-label">Collected from</label>
                <input type="date" className="field-input" value={sampleFilters.from} onChange={(e) => setSampleFilters({ ...sampleFilters, from: e.target.value })} />
              </div>
              <div>
                <label className="field-label">To</label>
                <input type="date" className="field-input" value={sampleFilters.to} onChange={(e) => setSampleFilters({ ...sampleFilters, to: e.target.value })} />
              </div>
            </div>
            <button
              className="btn-primary w-full"
              disabled={busy === 'samples'}
              onClick={() => handleDownload('samples', '/reports/samples', sampleFilters, 'samples-report.pdf')}
            >
              <Download size={15} /> {busy === 'samples' ? 'Generating…' : 'Download PDF'}
            </button>
          </div>
        </div>

        <div className="panel p-5">
          <h2 className="text-sm font-medium text-ink">Experiment records</h2>
          <p className="mt-1 text-xs text-muted">Experiments with protocol, samples and status.</p>
          <div className="mt-4 space-y-3">
            <div>
              <label className="field-label">Status</label>
              <select className="field-input" value={expFilters.status} onChange={(e) => setExpFilters({ ...expFilters, status: e.target.value })}>
                <option value="">Any status</option>
                {EXPERIMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="field-label">Started from</label>
                <input type="date" className="field-input" value={expFilters.from} onChange={(e) => setExpFilters({ ...expFilters, from: e.target.value })} />
              </div>
              <div>
                <label className="field-label">To</label>
                <input type="date" className="field-input" value={expFilters.to} onChange={(e) => setExpFilters({ ...expFilters, to: e.target.value })} />
              </div>
            </div>
            <button
              className="btn-primary w-full"
              disabled={busy === 'experiments'}
              onClick={() => handleDownload('experiments', '/reports/experiments', expFilters, 'experiments-report.pdf')}
            >
              <Download size={15} /> {busy === 'experiments' ? 'Generating…' : 'Download PDF'}
            </button>
          </div>
        </div>

        <div className="panel p-5">
          <h2 className="text-sm font-medium text-ink">Instrument usage</h2>
          <p className="mt-1 text-xs text-muted">Session log for one instrument or the whole lab.</p>
          <div className="mt-4 space-y-3">
            <div>
              <label className="field-label">Instrument</label>
              <select className="field-input" value={usageFilters.instrumentId} onChange={(e) => setUsageFilters({ ...usageFilters, instrumentId: e.target.value })}>
                <option value="">All instruments</option>
                {instruments.map((i) => <option key={i._id} value={i._id}>{i.instrumentId} ({i.name})</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="field-label">From</label>
                <input type="date" className="field-input" value={usageFilters.from} onChange={(e) => setUsageFilters({ ...usageFilters, from: e.target.value })} />
              </div>
              <div>
                <label className="field-label">To</label>
                <input type="date" className="field-input" value={usageFilters.to} onChange={(e) => setUsageFilters({ ...usageFilters, to: e.target.value })} />
              </div>
            </div>
            <button
              className="btn-primary w-full"
              disabled={busy === 'usage'}
              onClick={() => handleDownload('usage', '/reports/instrument-usage', usageFilters, 'instrument-usage-report.pdf')}
            >
              <Download size={15} /> {busy === 'usage' ? 'Generating…' : 'Download PDF'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
