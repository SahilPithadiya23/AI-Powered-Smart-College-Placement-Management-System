const steps = ['Applied', 'Shortlisted', 'Interview Round 1', 'Interview Round 2', 'Selected', 'Offer Released'];

export const Timeline = ({ active = 1 }) => (
  <div className="grid gap-3 sm:grid-cols-6">
    {steps.map((step, index) => (
      <div key={step} className="flex items-center gap-2">
        <span className={`grid h-7 w-7 place-items-center rounded-full text-xs font-semibold ${index < active ? 'bg-brand text-white' : 'bg-slate-200 text-slate-600'}`}>
          {index + 1}
        </span>
        <span className="text-sm text-slate-700">{step}</span>
      </div>
    ))}
  </div>
);
