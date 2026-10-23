import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', department: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create account');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="font-mono text-2xl tracking-tight text-ink">labtrack</p>
          <p className="mt-1 text-sm text-muted">Create a researcher account</p>
        </div>

        <form onSubmit={handleSubmit} className="panel p-6">
          {error && (
            <div className="mb-4 rounded-sm border border-rust/30 bg-rust-light px-3 py-2 text-sm text-rust">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="field-label" htmlFor="name">Full name</label>
            <input
              id="name"
              required
              className="field-input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Dr. Jane Doe"
            />
          </div>

          <div className="mb-4">
            <label className="field-label" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              className="field-input"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@lab.org"
            />
          </div>

          <div className="mb-4">
            <label className="field-label" htmlFor="department">Department</label>
            <input
              id="department"
              className="field-input"
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              placeholder="Molecular Biology"
            />
          </div>

          <div className="mb-6">
            <label className="field-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              className="field-input"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="At least 6 characters"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-muted">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-teal-dark hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
