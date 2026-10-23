export default function StatCard({ label, value, sub, icon: Icon }) {
  return (
    <div className="panel p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted">{label}</p>
          <p className="mt-2 font-mono text-3xl font-medium text-ink">{value}</p>
          {sub && <p className="mt-1 text-xs text-muted">{sub}</p>}
        </div>
        {Icon && (
          <div className="rounded-sm bg-teal-light p-2 text-teal-dark">
            <Icon size={18} strokeWidth={1.75} />
          </div>
        )}
      </div>
    </div>
  );
}
