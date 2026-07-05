import { Bookmark, CheckCircle2, MapPin, Send } from 'lucide-react';

export const JobCard = ({ job, onApply, onSave }) => {
  const hasApplied = Boolean(job.applicationStatus);

  return (
    <article className="rounded-md border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-ink">{job.title}</h3>
          <p className="text-sm text-slate-500">{job.company?.name || 'Company'} - {job.workMode}</p>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          {hasApplied && (
            <span className="rounded bg-sky-50 px-2 py-1 text-xs font-medium text-sky-700">
              {job.applicationStatus}
            </span>
          )}
          <span className="rounded bg-emerald-50 px-2 py-1 text-xs font-medium text-brand">{job.status}</span>
        </div>
      </div>
      <p className="mt-3 line-clamp-3 text-sm text-slate-600">{job.description}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {(job.requiredSkills || []).slice(0, 5).map((skill) => (
          <span key={skill} className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-700">{skill}</span>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 text-sm text-slate-600">
        <span className="flex items-center gap-1"><MapPin size={15} />{job.location || 'Flexible'}</span>
        <span className="font-semibold text-ink">{job.package} LPA</span>
      </div>
      <div className="mt-4 flex gap-2">
        <button
          disabled={hasApplied}
          onClick={() => onApply?.(job)}
          className="focus-ring inline-flex items-center gap-2 rounded-md bg-brand px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {hasApplied ? <CheckCircle2 size={16} /> : <Send size={16} />}
          {hasApplied ? 'Applied' : 'Apply'}
        </button>
        <button onClick={() => onSave?.(job)} className="focus-ring inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700">
          <Bookmark size={16} /> Save
        </button>
      </div>
    </article>
  );
};
