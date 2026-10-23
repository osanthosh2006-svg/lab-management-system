import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import api from '../api/axios';
import StatusTag from '../components/StatusTag';

export default function InstrumentDetail() {
  const { id } = useParams();
  const [instrument, setInstrument] = useState(null);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState('');
  const [purpose, setPurpose] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () => {
    api.get(`/instruments/${id}`).then(({ data }) => {
      setInstrument(data.instrument);
      setLogs(data.logs);
    }).catch((err) => setError(err.response?.data?.message || 'Failed to load instrument'));
  };

  useEffect(() => { load(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const activeLog = logs.find((l) => !l.endTime);

  const handleStart = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api.post(`/instruments/${id}/usage/start`, { purpose });
      setPurpose('');
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start usage session');
    } finally {
      setBusy(false);
    }
  };

  const handleEnd = async () => {
    setBusy(true);
    try {
      await api.post(`/instruments/${id}/usage/${activeLog._id}/end`, {});
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to end usage session');
    } finally {
      setBusy(false);
    }
  };

  if (error && !instrument) return <div className="rounded-sm border border-rust/30 bg-rust-light px-4 py-3 text-sm text-rust">{error}</div>;
  if (!instrument) return <p className="text-sm text-muted">Loading instrument…</p>;

  return (
    <div className="space-y-6">
      <Link to="/instruments" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
        <ArrowLeft size={15} /> Back to instruments
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <p className="id-code text-muted">{instrument.instrumentId}</p>
          <h1 className="mt-1 text-xl font-semibold text-ink">{instrument.name}</h1>
        </div>
        <StatusTag status={instrument.status} />
      </div>

      {error && <div className="rounded-sm border border-rust/30 bg-rust-light px-4 py-3 text-sm text-rust">{error}</div>}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="panel p-5 lg:col-span-2">
          <h2 className="mb-4 text-sm font-medium text-ink">Details</h2>
          <dl className="grid grid-cols-2 gap-y-4 text-sm">
            <div><dt className="text-xs text-muted">Model</dt><dd className="mt-0.5 text-ink">{instrument.model || '—'}</dd></div>
            <div><dt className="text-xs text-muted">Serial number</dt><dd className="mt-0.5 text-ink">{instrument.serialNumber || '—'}</dd></div>
            <div><dt className="text-xs text-muted">Category</dt><dd className="mt-0.5 text-ink">{instrument.category || '—'}</dd></div>
            <div><dt className="text-xs text-muted">Location</dt><dd className="mt-0.5 text-ink">{instrument.location || '—'}</dd></div>
            <div><dt className="text-xs text-muted">Last calibration</dt><dd className="mt-0.5 text-ink">{instrument.calibrationDate ? new Date(instrument.calibrationDate).toLocaleDateString() : '—'}</dd></div>
            <div><dt className="text-xs text-muted">Next calibration due</dt><dd className="mt-0.5 text-ink">{instrument.nextCalibrationDue ? new Date(instrument.nextCalibrationDue).toLocaleDateString() : '—'}</dd></div>
          </dl>
        </div>

        <div className="panel p-5">
          <h2 className="mb-4 text-sm font-medium text-ink">Usage session</h2>
          {activeLog ? (
            <div className="space-y-3">
              <p className="text-sm text-ink">In use since {new Date(activeLog.startTime).toLocaleString()}</p>
              {activeLog.purpose && <p className="text-sm text-muted">{activeLog.purpose}</p>}
              <button onClick={handleEnd} disabled={busy} className="btn-secondary w-full">
                {busy ? 'Ending…' : 'End session'}
              </button>
            </div>
          ) : instrument.status === 'Available' ? (
            <form onSubmit={handleStart} className="space-y-3">
              <div>
                <label className="field-label">Purpose</label>
                <input className="field-input" value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="What is this run for?" />
              </div>
              <button type="submit" disabled={busy} className="btn-primary w-full">
                {busy ? 'Starting…' : 'Start usage session'}
              </button>
            </form>
          ) : (
            <p className="text-sm text-muted">Instrument is currently {instrument.status.toLowerCase()}.</p>
          )}
        </div>
      </div>

      <div className="panel p-5">
        <h2 className="mb-4 text-sm font-medium text-ink">Usage history</h2>
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line text-xs text-muted">
            <tr>
              <th className="py-2 font-medium">Used by</th>
              <th className="py-2 font-medium">Experiment</th>
              <th className="py-2 font-medium">Purpose</th>
              <th className="py-2 font-medium">Start</th>
              <th className="py-2 font-medium">End</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {logs.map((l) => (
              <tr key={l._id}>
                <td className="py-2 text-ink">{l.user?.name}</td>
                <td className="py-2 text-muted">{l.experiment ? l.experiment.experimentId : '—'}</td>
                <td className="py-2 text-muted">{l.purpose || '—'}</td>
                <td className="py-2 text-muted">{new Date(l.startTime).toLocaleString()}</td>
                <td className="py-2 text-muted">{l.endTime ? new Date(l.endTime).toLocaleString() : 'Ongoing'}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr><td colSpan={5} className="py-6 text-center text-sm text-muted">No usage recorded yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
