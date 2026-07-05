export const StatCard = ({ label, value, tone = 'brand' }) => (
  <div className="rounded-md border border-slate-200 bg-white p-4">
    <p className="text-sm text-slate-500">{label}</p>
    <p className={`mt-2 text-2xl font-semibold ${tone === 'accent' ? 'text-accent' : 'text-brand'}`}>{value ?? 0}</p>
  </div>
);
