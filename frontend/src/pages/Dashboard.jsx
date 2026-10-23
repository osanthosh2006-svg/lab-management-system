import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TestTube, FlaskConical, Wrench, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../api/axios';
import StatCard from '../components/StatCard';
import StatusTag from '../components/StatusTag';

const STATUS_ORDER = ['Registered', 'In Storage', 'In Use', 'Analyzed', 'Archived', 'Disposed'];

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/dashboard/summary')
      .then(({ data }) => setSummary(data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load dashboard'));
  }, []);

  if (error) {
    return <div className="rounded-sm border border-rust/30 bg-rust-light px-4 py-3 text-sm text-rust">{error}</div>;
  }

  if (!summary) {
    return <p className="text-sm text-muted">Loading overview…</p>;
  }

  const sampleChartData = STATUS_ORDER.map((status) => ({
    status,
    count: summary.samplesByStatus[status] || 0
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-ink">Overview</h1>
        <p className="mt-1 text-sm text-muted">A snapshot of samples, experiments and equipment across the lab.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total samples" value={summary.totals.samples} icon={TestTube} />
        <StatCard label="Total experiments" value={summary.totals.experiments} icon={FlaskConical} />
        <StatCard label="Instruments" value={summary.totals.instruments} icon={Wrench} />
        <StatCard
          label="Active instrument sessions"
          value={summary.totals.activeInstrumentSessions}
          icon={Activity}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="panel p-5 lg:col-span-2">
          <h2 className="mb-4 text-sm font-medium text-ink">Samples by status</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={sampleChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#DBE1DC" vertical={false} />
              <XAxis dataKey="status" tick={{ fontSize: 11, fill: '#5B6B6A' }} interval={0} angle={-20} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 11, fill: '#5B6B6A' }} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: 4, borderColor: '#DBE1DC', fontSize: 12 }} />
              <Bar dataKey="count" fill="#1B7A72" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="panel p-5">
          <h2 className="mb-4 text-sm font-medium text-ink">Instruments</h2>
          <ul className="space-y-3">
            {Object.entries(summary.instrumentsByStatus).map(([status, count]) => (
              <li key={status} className="flex items-center justify-between text-sm">
                <StatusTag status={status} />
                <span className="font-mono text-ink">{count}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="panel p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-medium text-ink">Recent samples</h2>
            <Link to="/samples" className="text-xs font-medium text-teal-dark hover:underline">View all</Link>
          </div>
          <ul className="divide-y divide-line">
            {summary.recentSamples.map((s) => (
              <li key={s._id} className="flex items-center justify-between py-2.5">
                <div>
                  <p className="text-sm text-ink">{s.name}</p>
                  <p className="id-code text-muted">{s.sampleId}</p>
                </div>
                <StatusTag status={s.status} />
              </li>
            ))}
            {summary.recentSamples.length === 0 && (
              <li className="py-2.5 text-sm text-muted">No samples registered yet.</li>
            )}
          </ul>
        </div>

        <div className="panel p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-medium text-ink">Recent experiments</h2>
            <Link to="/experiments" className="text-xs font-medium text-teal-dark hover:underline">View all</Link>
          </div>
          <ul className="divide-y divide-line">
            {summary.recentExperiments.map((e) => (
              <li key={e._id} className="flex items-center justify-between py-2.5">
                <div>
                  <p className="text-sm text-ink">{e.title}</p>
                  <p className="id-code text-muted">{e.experimentId}</p>
                </div>
                <StatusTag status={e.status} />
              </li>
            ))}
            {summary.recentExperiments.length === 0 && (
              <li className="py-2.5 text-sm text-muted">No experiments logged yet.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
