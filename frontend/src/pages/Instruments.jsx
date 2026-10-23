import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import api from '../api/axios';
import StatusTag from '../components/StatusTag';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';

const emptyForm = { name: '', model: '', serialNumber: '', category: '', location: '', calibrationDate: '', nextCalibrationDue: '' };

export default function Instruments() {
  const { user } = useAuth();
  const [instruments, setInstruments] = useState([]);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = () => {
    api.get('/instruments').then(({ data }) => setInstruments(data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load instruments'));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/instruments', form);
      setShowModal(false);
      setForm(emptyForm);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add instrument');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink">Instruments</h1>
          <p className="mt-1 text-sm text-muted">Equipment inventory, availability and calibration schedule.</p>
        </div>
        {user?.role === 'admin' && (
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <Plus size={16} /> Add instrument
          </button>
        )}
      </div>

      {error && <div className="rounded-sm border border-rust/30 bg-rust-light px-4 py-3 text-sm text-rust">{error}</div>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {instruments.map((i) => (
          <Link key={i._id} to={`/instruments/${i._id}`} className="panel block p-5 transition-colors hover:border-teal">
            <div className="flex items-start justify-between">
              <div>
                <p className="id-code text-muted">{i.instrumentId}</p>
                <h3 className="mt-1 text-sm font-medium text-ink">{i.name}</h3>
                <p className="mt-0.5 text-xs text-muted">{i.model} {i.location ? `· ${i.location}` : ''}</p>
              </div>
              <StatusTag status={i.status} />
            </div>
          </Link>
        ))}
        {instruments.length === 0 && (
          <p className="col-span-full py-8 text-center text-sm text-muted">No instruments registered yet.</p>
        )}
      </div>

      {showModal && (
        <Modal title="Add instrument" onClose={() => setShowModal(false)}>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="field-label">Name</label>
              <input required className="field-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Refrigerated Centrifuge" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="field-label">Model</label>
                <input className="field-input" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />
              </div>
              <div>
                <label className="field-label">Serial number</label>
                <input className="field-input" value={form.serialNumber} onChange={(e) => setForm({ ...form, serialNumber: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="field-label">Category</label>
                <input className="field-input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Analytical" />
              </div>
              <div>
                <label className="field-label">Location</label>
                <input className="field-input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Bench 3" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="field-label">Last calibration</label>
                <input type="date" className="field-input" value={form.calibrationDate} onChange={(e) => setForm({ ...form, calibrationDate: e.target.value })} />
              </div>
              <div>
                <label className="field-label">Next calibration due</label>
                <input type="date" className="field-input" value={form.nextCalibrationDue} onChange={(e) => setForm({ ...form, nextCalibrationDue: e.target.value })} />
              </div>
            </div>
            {error && <p className="text-sm text-rust">{error}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving…' : 'Add instrument'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
