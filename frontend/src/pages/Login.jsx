import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to sign in');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="font-mono text-2xl tracking-tight text-ink">labtrack</p>
          <p className="mt-1 text-sm text-muted">Sign in to your laboratory workspace</p>
        </div>

        <form onSubmit={handleSubmit} className="panel p-6">
          {error && (
            <div className="mb-4 rounded-sm border border-rust/30 bg-rust-light px-3 py-2 text-sm text-rust">
              {error}
            </div>
          )}

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

          <div className="mb-6">
            <label className="field-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              className="field-input"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Signing in…' : 'Sign in'}
          </button>

          <p className="mt-4 text-center text-xs text-muted">
            Demo accounts: admin@labtrack.io / admin123 &nbsp;or&nbsp; researcher@labtrack.io / research123
          </p>
        </form>

        <p className="mt-5 text-center text-sm text-muted">
          Need an account?{' '}
          <Link to="/register" className="font-medium text-teal-dark hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
