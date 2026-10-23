import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import api from '../api/axios';
import StatusTag from '../components/StatusTag';
import Modal from '../components/Modal';

const EXPERIMENT_STATUSES = ['Planned', 'In Progress', 'Completed', 'Cancelled'];

const emptyForm = { title: '', objective: '', protocol: '', startDate: '', samples: [], instrumentsUsed: [] };

export default function Experiments() {
  const [experiments, setExperiments] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [availableSamples, setAvailableSamples] = useState([]);
  const [availableInstruments, setAvailableInstruments] = useState([]);

  const load = () => {
    setLoading(true);
    api
      .get('/experiments', { params: { status: status || undefined } })
      .then(({ data }) => setExperiments(data.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load experiments'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [status]); // eslint-disable-line react-hooks/exhaustive-deps

  const openModal = async () => {
    setShowModal(true);
    const [samplesRes, instrumentsRes] = await Promise.all([
      api.get('/samples', { params: { limit: 100 } }),
      api.get('/instruments')
    ]);
    setAvailableSamples(samplesRes.data.data);
    setAvailableInstruments(instrumentsRes.data);
  };

  const toggleMulti = (field, id) => {
    setForm((prev) => {
      const current = prev[field];
      return {
        ...prev,
        [field]: current.includes(id) ? current.filter((v) => v !== id) : [...current, id]
      };
    });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.post('/experiments', form);
      setShowModal(false);
      setForm(emptyForm);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create experiment');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink">Experiments</h1>
          <p className="mt-1 text-sm text-muted">Document protocols, linked samples, and results.</p>
        </div>
        <button onClick={openModal} className="btn-primary">
          <Plus size={16} /> New experiment
        </button>
      </div>

      <select className="field-input w-48" value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="">All statuses</option>
        {EXPERIMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>

      {error && <div className="rounded-sm border border-rust/30 bg-rust-light px-4 py-3 text-sm text-rust">{error}</div>}

      <div className="panel overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-paper/60 text-xs text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Experiment ID</th>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Assigned to</th>
              <th className="px-4 py-3 font-medium">Samples</th>
              <th className="px-4 py-3 font-medium">Start date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {experiments.map((exp) => (
              <tr key={exp._id} className="hover:bg-paper/50">
                <td className="px-4 py-3">
                  <Link to={`/experiments/${exp._id}`} className="id-code text-teal-dark hover:underline">{exp.experimentId}</Link>
                </td>
                <td className="px-4 py-3 text-ink">{exp.title}</td>
                <td className="px-4 py-3"><StatusTag status={exp.status} /></td>
                <td className="px-4 py-3 text-muted">{exp.assignedTo?.name}</td>
                <td className="px-4 py-3 text-muted">{exp.samples.length}</td>
                <td className="px-4 py-3 text-muted">{new Date(exp.startDate).toLocaleDateString()}</td>
              </tr>
            ))}
            {!loading && experiments.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-muted">No experiments recorded yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal title="New experiment" onClose={() => setShowModal(false)} wide>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="field-label">Title</label>
              <input required className="field-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Plasma Protein Quantification" />
            </div>
            <div>
              <label className="field-label">Objective</label>
              <textarea className="field-input" rows={2} value={form.objective} onChange={(e) => setForm({ ...form, objective: e.target.value })} />
            </div>
            <div>
              <label className="field-label">Protocol / methodology</label>
              <textarea className="field-input" rows={3} value={form.protocol} onChange={(e) => setForm({ ...form, protocol: e.target.value })} />
            </div>
            <div>
              <label className="field-label">Start date</label>
              <input required type="date" className="field-input" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="field-label">Link samples</label>
                <div className="max-h-36 space-y-1 overflow-y-auto rounded-sm border border-line p-2">
                  {availableSamples.map((s) => (
                    <label key={s._id} className="flex items-center gap-2 text-sm text-ink">
                      <input type="checkbox" checked={form.samples.includes(s._id)} onChange={() => toggleMulti('samples', s._id)} />
                      <span className="id-code text-muted">{s.sampleId}</span> {s.name}
                    </label>
                  ))}
                  {availableSamples.length === 0 && <p className="text-xs text-muted">No samples available</p>}
                </div>
              </div>
              <div>
                <label className="field-label">Instruments used</label>
                <div className="max-h-36 space-y-1 overflow-y-auto rounded-sm border border-line p-2">
                  {availableInstruments.map((i) => (
                    <label key={i._id} className="flex items-center gap-2 text-sm text-ink">
                      <input type="checkbox" checked={form.instrumentsUsed.includes(i._id)} onChange={() => toggleMulti('instrumentsUsed', i._id)} />
                      <span className="id-code text-muted">{i.instrumentId}</span> {i.name}
                    </label>
                  ))}
                  {availableInstruments.length === 0 && <p className="text-xs text-muted">No instruments available</p>}
                </div>
              </div>
            </div>

            {error && <p className="text-sm text-rust">{error}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving…' : 'Create experiment'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
