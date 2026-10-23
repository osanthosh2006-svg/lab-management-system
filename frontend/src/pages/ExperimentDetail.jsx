import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import api from '../api/axios';
import StatusTag from '../components/StatusTag';

const EXPERIMENT_STATUSES = ['Planned', 'In Progress', 'Completed', 'Cancelled'];

export default function ExperimentDetail() {
  const { id } = useParams();
  const [experiment, setExperiment] = useState(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ status: '', results: '', endDate: '', notes: '' });
  const [saving, setSaving] = useState(false);

  const load = () => {
    api.get(`/experiments/${id}`).then(({ data }) => {
      setExperiment(data);
      setForm({
        status: data.status,
        results: data.results || '',
        endDate: data.endDate ? data.endDate.slice(0, 10) : '',
        notes: data.notes || ''
      });
    }).catch((err) => setError(err.response?.data?.message || 'Failed to load experiment'));
  };

  useEffect(() => { load(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/experiments/${id}`, form);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  if (error) return <div className="rounded-sm border border-rust/30 bg-rust-light px-4 py-3 text-sm text-rust">{error}</div>;
  if (!experiment) return <p className="text-sm text-muted">Loading experiment…</p>;

  return (
    <div className="space-y-6">
      <Link to="/experiments" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
        <ArrowLeft size={15} /> Back to experiments
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <p className="id-code text-muted">{experiment.experimentId}</p>
          <h1 className="mt-1 text-xl font-semibold text-ink">{experiment.title}</h1>
        </div>
        <StatusTag status={experiment.status} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="panel p-5 lg:col-span-2 space-y-5">
          <div>
            <h2 className="mb-2 text-sm font-medium text-ink">Objective</h2>
            <p className="text-sm text-ink">{experiment.objective || '—'}</p>
          </div>
          <div>
            <h2 className="mb-2 text-sm font-medium text-ink">Protocol</h2>
            <p className="whitespace-pre-wrap text-sm text-ink">{experiment.protocol || '—'}</p>
          </div>
          <div>
            <h2 className="mb-2 text-sm font-medium text-ink">Linked samples</h2>
            <div className="flex flex-wrap gap-2">
              {experiment.samples.map((s) => (
                <Link key={s._id} to={`/samples/${s._id}`} className="id-code rounded-sm border border-line bg-paper px-2 py-1 text-teal-dark hover:underline">
                  {s.sampleId}
                </Link>
              ))}
              {experiment.samples.length === 0 && <p className="text-sm text-muted">No samples linked.</p>}
            </div>
          </div>
          <div>
            <h2 className="mb-2 text-sm font-medium text-ink">Instruments used</h2>
            <div className="flex flex-wrap gap-2">
              {experiment.instrumentsUsed.map((i) => (
                <Link key={i._id} to={`/instruments/${i._id}`} className="id-code rounded-sm border border-line bg-paper px-2 py-1 text-teal-dark hover:underline">
                  {i.instrumentId}
                </Link>
              ))}
              {experiment.instrumentsUsed.length === 0 && <p className="text-sm text-muted">No instruments linked.</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><dt className="text-xs text-muted">Assigned to</dt><dd className="mt-0.5 text-ink">{experiment.assignedTo?.name}</dd></div>
            <div><dt className="text-xs text-muted">Start date</dt><dd className="mt-0.5 text-ink">{new Date(experiment.startDate).toLocaleDateString()}</dd></div>
          </div>
        </div>

        <div className="panel p-5">
          <h2 className="mb-4 text-sm font-medium text-ink">Update experiment</h2>
          <form onSubmit={handleSave} className="space-y-3">
            <div>
              <label className="field-label">Status</label>
              <select className="field-input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {EXPERIMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">End date</label>
              <input type="date" className="field-input" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
            </div>
            <div>
              <label className="field-label">Results</label>
              <textarea rows={4} className="field-input" value={form.results} onChange={(e) => setForm({ ...form, results: e.target.value })} placeholder="Record findings, measurements, conclusions…" />
            </div>
            <div>
              <label className="field-label">Notes</label>
              <textarea rows={2} className="field-input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
            <button type="submit" disabled={saving} className="btn-primary w-full">{saving ? 'Saving…' : 'Save changes'}</button>
          </form>
        </div>
      </div>
    </div>
  );
}
