import { CheckCircle2, AlertTriangle, RefreshCw, FileText, Sparkles, ExternalLink, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ResumeContextCard = ({ context, readiness, loading, error, onRefresh }) => {
  const student = context?.student || {};
  const resume = context?.resume;
  const hasResume = readiness?.hasResume ?? Boolean(resume);

  // Derive counts safely without NaN or undefined
  const skills = student.skills || resume?.parsed?.skills || [];
  const skillsCount = readiness?.totalSkillsCount ?? skills.length;
  const projects = resume?.parsed?.projects || resume?.projects || [];
  const projectsCount = readiness?.totalProjectsCount ?? projects.length;
  const certifications = resume?.parsed?.certifications || resume?.certifications || [];
  const certsCount = readiness?.totalCertificationsCount ?? certifications.length;

  const resumeName = readiness?.resumeName || resume?.label || 'Default Resume.pdf';
  const isContextReady = readiness?.isComplete || (hasResume && skillsCount > 0);

  // 1. Loading Skeleton State
  if (loading && !context) {
    return (
      <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs">
        {/* Header Skeleton */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-slate-100 animate-pulse" />
            <div className="space-y-1.5">
              <div className="h-5 w-36 rounded bg-slate-100 animate-pulse" />
              <div className="h-3.5 w-52 rounded bg-slate-100 animate-pulse" />
            </div>
          </div>
          <div className="h-8 w-28 rounded-lg bg-slate-100 animate-pulse" />
        </div>

        {/* Resume Banner Skeleton */}
        <div className="mt-4 h-14 rounded-lg bg-slate-100 animate-pulse" />

        {/* Profile Header Skeleton */}
        <div className="mt-5 space-y-2.5">
          <div className="h-3 w-28 rounded bg-slate-100 animate-pulse" />
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-16 rounded-lg bg-slate-100 animate-pulse" />
            ))}
          </div>
        </div>

        {/* Skills Skeleton */}
        <div className="mt-4 space-y-2">
          <div className="h-3 w-16 rounded bg-slate-100 animate-pulse" />
          <div className="flex flex-wrap gap-1.5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-6 w-16 rounded-full bg-slate-100 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 2. Error State
  if (error && !context) {
    return (
      <div className="rounded-xl border border-rose-200/80 bg-white p-6 shadow-xs text-center">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
          <AlertTriangle size={20} />
        </div>
        <h3 className="mt-3 text-sm font-semibold text-slate-800">Unable to load resume context</h3>
        <p className="mt-1 text-xs text-slate-500">
          We encountered an issue retrieving your profile and resume data.
        </p>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="focus-ring mt-4 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition shadow-xs"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin text-brand' : ''} />
          {loading ? 'Refreshing...' : 'Refresh Context'}
        </button>
      </div>
    );
  }

  // 3. No Resume State
  if (!hasResume && !loading) {
    return (
      <div className="rounded-xl border border-slate-200/90 bg-white p-6 shadow-xs">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 border border-teal-100 text-teal-700 shadow-xs">
              <Sparkles size={18} />
            </span>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-ink">AI Interview Coach</h2>
              <p className="text-xs text-slate-500">Practice smarter with your resume</p>
            </div>
          </div>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition shadow-xs disabled:opacity-60"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        <div className="my-6 rounded-lg border border-dashed border-amber-200 bg-amber-50/50 p-6 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100/80 text-amber-700">
            <FileText size={20} />
          </div>
          <h3 className="mt-3 text-sm font-semibold text-slate-800">No Default Resume Detected</h3>
          <p className="mx-auto mt-1 max-w-sm text-xs text-slate-600">
            Upload your resume in Profile to unlock personalized questions, project-grounded technical queries, and AI interview coaching.
          </p>
          <Link
            to="/profile"
            className="focus-ring mt-4 inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-xs font-medium text-white hover:bg-brand/90 transition shadow-xs"
          >
            <span>Go to Profile</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    );
  }

  // 4. Full Ready Card
  return (
    <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs transition-shadow hover:shadow-sm">
      {/* Header */}
      <div className="border-b border-slate-100 pb-3.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-50 border border-teal-100/80 text-teal-700 shadow-xs">
              <Sparkles size={18} />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold tracking-tight text-ink">AI Interview Coach</h2>
                {isContextReady ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    AI Ready
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-200/80 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                    <AlertTriangle size={11} />
                    Limited Context
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onRefresh}
            disabled={loading}
            className="focus-ring shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 sm:px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 transition shadow-xs disabled:opacity-60"
            title="Refresh resume and profile context"
            aria-label="Refresh resume context"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin text-brand' : ''} />
            <span>{loading ? 'Refreshing...' : 'Refresh Context'}</span>
          </button>
        </div>

        <p className="mt-2 text-xs text-slate-500 leading-relaxed">
          Practice with questions generated from your resume and get AI-powered interview guidance.
        </p>
      </div>

      {/* Resume Status Banner */}
      <div className="mt-4">
        <div className="rounded-lg border border-emerald-200/80 bg-emerald-50/50 p-3 transition-colors hover:bg-emerald-50/70">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-900">
                Resume Ready
              </span>
            </div>
            <Link
              to="/profile"
              className="focus-ring inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100/70 hover:text-emerald-900 transition"
              title="Change or upload a different resume in Profile"
            >
              <span>Change</span>
              <ExternalLink size={12} />
            </Link>
          </div>
          <p
            className="mt-1.5 truncate font-mono text-xs font-medium text-slate-700"
            title={resumeName}
          >
            {resumeName}
          </p>
        </div>
      </div>

      {/* Profile Context Section */}
      <div className="mt-5">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Profile Context
          </h3>
          <span className="text-[10px] text-slate-400 font-medium">Auto-synced</span>
        </div>

        {/* 6 Responsive Stat Cards: 3 per row on desktop/tablet, 2 per row on mobile */}
        <div className="mt-2.5 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          <div className="rounded-lg border border-slate-200/70 bg-slate-50/60 p-3 transition-colors hover:bg-slate-50 hover:border-slate-300/80">
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Name
            </span>
            <p className="mt-0.5 truncate text-sm font-bold text-ink" title={student.name || 'Not added'}>
              {student.name || 'Not added'}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200/70 bg-slate-50/60 p-3 transition-colors hover:bg-slate-50 hover:border-slate-300/80">
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Branch
            </span>
            <p className="mt-0.5 truncate text-sm font-bold text-ink" title={student.branch || 'Not specified'}>
              {student.branch || 'Not specified'}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200/70 bg-slate-50/60 p-3 transition-colors hover:bg-slate-50 hover:border-slate-300/80">
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              CGPA
            </span>
            <p className="mt-0.5 text-sm font-bold text-ink">
              {student.cgpa ? `${student.cgpa} / 10` : '—'}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200/70 bg-slate-50/60 p-3 transition-colors hover:bg-slate-50 hover:border-slate-300/80">
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Skills
            </span>
            <p className="mt-0.5 text-sm font-bold text-ink">
              {skillsCount}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200/70 bg-slate-50/60 p-3 transition-colors hover:bg-slate-50 hover:border-slate-300/80">
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Projects
            </span>
            <p className="mt-0.5 text-sm font-bold text-ink">
              {projectsCount}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200/70 bg-slate-50/60 p-3 transition-colors hover:bg-slate-50 hover:border-slate-300/80">
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 truncate">
              Certifications
            </span>
            <p className="mt-0.5 text-sm font-bold text-ink">
              {certsCount}
            </p>
          </div>
        </div>
      </div>

      {/* Skills Section */}
      <div className="mt-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Skills
          </h3>
          {skills.length > 0 && (
            <span className="text-[10px] text-slate-400 font-medium">
              {skills.length} available
            </span>
          )}
        </div>

        {skills.length > 0 ? (
          <div className="flex flex-wrap items-center gap-1.5">
            {skills.slice(0, 10).map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center rounded-full border border-slate-200/80 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100"
              >
                {skill}
              </span>
            ))}
            {skills.length > 10 && (
              <span className="inline-flex items-center rounded-full border border-teal-200/70 bg-teal-50 px-2 py-0.5 text-[11px] font-semibold text-teal-700">
                +{skills.length - 10} more
              </span>
            )}
          </div>
        ) : (
          <p className="text-xs italic text-slate-400">No skills extracted yet</p>
        )}

        {/* Projects Preview if available */}
        {projects.length > 0 && (
          <div className="mt-3 border-t border-slate-100 pt-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mr-1">
                Projects:
              </span>
              {projects.slice(0, 3).map((p, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 rounded-md border border-teal-100 bg-teal-50/70 px-2 py-0.5 text-[11px] font-medium text-brand"
                  title={p.description || p.title}
                >
                  <FileText size={10} className="shrink-0" />
                  <span className="max-w-[130px] truncate">{p.title}</span>
                </span>
              ))}
              {projects.length > 3 && (
                <span className="text-[10px] font-medium text-slate-400">
                  +{projects.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

