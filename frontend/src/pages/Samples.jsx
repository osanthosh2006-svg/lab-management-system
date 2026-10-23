import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import api from '../api/axios';
import StatusTag from '../components/StatusTag';
import Modal from '../components/Modal';

const SAMPLE_STATUSES = ['Registered', 'In Storage', 'In Use', 'Analyzed', 'Archived', 'Disposed'];

const emptyForm = {
  name: '', type: '', source: '', collectionDate: '', storageLocation: '', quantity: '', description: ''
};

export default function Samples() {
  const [samples, setSamples] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 });
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = (page = 1) => {
    setLoading(true);
    api
      .get('/samples', { params: { status: status || undefined, q: q || undefined, page } })
      .then(({ data }) => {
        setSamples(data.data);
        setMeta({ page: data.page, pages: data.pages, total: data.total });
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load samples'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(1); }, [status]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (e) => {
    e.preventDefault();
    load(1);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.post('/samples', form);
      setShowModal(false);
      setForm(emptyForm);
      load(1);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register sample');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink">Samples</h1>
          <p className="mt-1 text-sm text-muted">Track every specimen from intake to disposal.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus size={16} /> Register sample
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative">
            <Search size={15} className="absolute left-2.5 top-2.5 text-muted" />
            <input
              className="field-input w-64 pl-8"
              placeholder="Search name, type, source"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-secondary text-sm">Search</button>
        </form>

        <select className="field-input w-48" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {SAMPLE_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {error && <div className="rounded-sm border border-rust/30 bg-rust-light px-4 py-3 text-sm text-rust">{error}</div>}

      <div className="panel overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-paper/60 text-xs text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Sample ID</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Storage location</th>
              <th className="px-4 py-3 font-medium">Collected</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {samples.map((s) => (
              <tr key={s._id} className="hover:bg-paper/50">
                <td className="px-4 py-3">
                  <Link to={`/samples/${s._id}`} className="id-code text-teal-dark hover:underline">{s.sampleId}</Link>
                </td>
                <td className="px-4 py-3 text-ink">{s.name}</td>
                <td className="px-4 py-3 text-muted">{s.type}</td>
                <td className="px-4 py-3"><StatusTag status={s.status} /></td>
                <td className="px-4 py-3 text-muted">{s.storageLocation || '—'}</td>
                <td className="px-4 py-3 text-muted">{new Date(s.collectionDate).toLocaleDateString()}</td>
              </tr>
            ))}
            {!loading && samples.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-muted">No samples match these filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {meta.pages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted">
          <span>Page {meta.page} of {meta.pages} · {meta.total} samples</span>
          <div className="flex gap-2">
            <button disabled={meta.page <= 1} onClick={() => load(meta.page - 1)} className="btn-secondary text-xs">Previous</button>
            <button disabled={meta.page >= meta.pages} onClick={() => load(meta.page + 1)} className="btn-secondary text-xs">Next</button>
          </div>
        </div>
      )}

      {showModal && (
        <Modal title="Register a new sample" onClose={() => setShowModal(false)}>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="field-label">Sample name</label>
              <input required className="field-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Plasma Sample A1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="field-label">Type</label>
                <input required className="field-input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} placeholder="Blood Plasma" />
              </div>
              <div>
                <label className="field-label">Source</label>
                <input className="field-input" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} placeholder="Donor-014" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="field-label">Collection date</label>
                <input required type="date" className="field-input" value={form.collectionDate} onChange={(e) => setForm({ ...form, collectionDate: e.target.value })} />
              </div>
              <div>
                <label className="field-label">Quantity</label>
                <input className="field-input" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} placeholder="5 mL" />
              </div>
            </div>
            <div>
              <label className="field-label">Storage location</label>
              <input className="field-input" value={form.storageLocation} onChange={(e) => setForm({ ...form, storageLocation: e.target.value })} placeholder="Freezer-2/Shelf-B" />
            </div>
            <div>
              <label className="field-label">Description</label>
              <textarea className="field-input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            {error && <p className="text-sm text-rust">{error}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving…' : 'Register sample'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
