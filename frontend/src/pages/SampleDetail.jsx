import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import api from '../api/axios';
import StatusTag from '../components/StatusTag';

const SAMPLE_STATUSES = ['Registered', 'In Storage', 'In Use', 'Analyzed', 'Archived', 'Disposed'];

export default function SampleDetail() {
  const { id } = useParams();
  const [sample, setSample] = useState(null);
  const [error, setError] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [note, setNote] = useState('');
  const [updating, setUpdating] = useState(false);

  const load = () => {
    api.get(`/samples/${id}`).then(({ data }) => {
      setSample(data);
      setNewStatus(data.status);
    }).catch((err) => setError(err.response?.data?.message || 'Failed to load sample'));
  };

  useEffect(() => { load(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await api.patch(`/samples/${id}/status`, { status: newStatus, note });
      setNote('');
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  if (error) return <div className="rounded-sm border border-rust/30 bg-rust-light px-4 py-3 text-sm text-rust">{error}</div>;
  if (!sample) return <p className="text-sm text-muted">Loading sample…</p>;

  return (
    <div className="space-y-6">
      <Link to="/samples" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
        <ArrowLeft size={15} /> Back to samples
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <p className="id-code text-muted">{sample.sampleId}</p>
          <h1 className="mt-1 text-xl font-semibold text-ink">{sample.name}</h1>
        </div>
        <StatusTag status={sample.status} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="panel p-5 lg:col-span-2">
          <h2 className="mb-4 text-sm font-medium text-ink">Sample details</h2>
          <dl className="grid grid-cols-2 gap-y-4 text-sm">
            <div><dt className="text-xs text-muted">Type</dt><dd className="mt-0.5 text-ink">{sample.type}</dd></div>
            <div><dt className="text-xs text-muted">Source</dt><dd className="mt-0.5 text-ink">{sample.source || '—'}</dd></div>
            <div><dt className="text-xs text-muted">Collection date</dt><dd className="mt-0.5 text-ink">{new Date(sample.collectionDate).toLocaleDateString()}</dd></div>
            <div><dt className="text-xs text-muted">Quantity</dt><dd className="mt-0.5 text-ink">{sample.quantity || '—'}</dd></div>
            <div><dt className="text-xs text-muted">Storage location</dt><dd className="mt-0.5 text-ink">{sample.storageLocation || '—'}</dd></div>
            <div><dt className="text-xs text-muted">Registered by</dt><dd className="mt-0.5 text-ink">{sample.registeredBy?.name}</dd></div>
            <div className="col-span-2"><dt className="text-xs text-muted">Description</dt><dd className="mt-0.5 text-ink">{sample.description || '—'}</dd></div>
          </dl>
        </div>

        <div className="panel p-5">
          <h2 className="mb-4 text-sm font-medium text-ink">Update status</h2>
          <form onSubmit={handleStatusUpdate} className="space-y-3">
            <div>
              <label className="field-label">New status</label>
              <select className="field-input" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                {SAMPLE_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">Note (optional)</label>
              <input className="field-input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. moved to long-term storage" />
            </div>
            <button type="submit" disabled={updating} className="btn-primary w-full">
              {updating ? 'Updating…' : 'Update status'}
            </button>
          </form>
        </div>
      </div>

      <div className="panel p-5">
        <h2 className="mb-4 text-sm font-medium text-ink">Status history</h2>
        <ol className="space-y-4 border-l border-line pl-4">
          {[...sample.statusHistory].reverse().map((entry, idx) => (
            <li key={idx} className="relative">
              <span className="absolute -left-[21px] top-1 h-2 w-2 rounded-full bg-teal" />
              <div className="flex items-center gap-2">
                <StatusTag status={entry.status} />
                <span className="text-xs text-muted">{new Date(entry.changedAt).toLocaleString()}</span>
              </div>
              {entry.note && <p className="mt-1 text-sm text-ink">{entry.note}</p>}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
