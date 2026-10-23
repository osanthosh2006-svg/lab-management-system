import { NavLink } from 'react-router-dom';
import { LayoutDashboard, TestTube, FlaskConical, Wrench, FileBarChart } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/samples', label: 'Samples', icon: TestTube },
  { to: '/experiments', label: 'Experiments', icon: FlaskConical },
  { to: '/instruments', label: 'Instruments', icon: Wrench },
  { to: '/reports', label: 'Reports', icon: FileBarChart }
];

export default function Sidebar() {
  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col bg-ink text-white/90">
      <div className="px-6 py-6">
        <p className="font-mono text-lg tracking-tight text-white">labtrack</p>
        <p className="mt-0.5 text-[11px] text-white/50">sample &amp; experiment tracking</p>
      </div>

      <nav className="flex-1 px-3">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `mb-1 flex items-center gap-3 rounded-sm border-l-2 px-3 py-2.5 text-sm transition-colors ${
                isActive
                  ? 'border-teal bg-white/5 text-white font-medium'
                  : 'border-transparent text-white/60 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <Icon size={17} strokeWidth={1.75} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-6 py-5 text-[11px] text-white/40">
        Version 1.0.0
      </div>
    </aside>
  );
}
