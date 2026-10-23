import { Outlet } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b border-line bg-surface px-6 py-3">
          <div>
            <p className="text-sm text-muted">
              Signed in as <span className="font-medium text-ink">{user?.name}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-sm bg-teal-light px-2.5 py-1 text-xs font-medium text-teal-dark">
              {user?.role}
            </span>
            <button onClick={logout} className="btn-secondary text-xs">
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto px-6 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
