import { Link } from 'react-router-dom';
import { AlertCircle, FileText, Sparkles, RefreshCw } from 'lucide-react';

export const AIEmptyState = ({ type = 'no_questions', errorMessage, onRetry }) => {
  if (type === 'no_resume') {
    return (
      <div className="rounded-md border border-amber-200 bg-amber-50 p-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
          <FileText size={24} />
        </div>
        <h3 className="mt-3 text-base font-semibold text-amber-900">Upload a resume to unlock resume-based interview preparation</h3>
        <p className="mt-1 text-sm text-amber-700">
          We generate grounded questions and tailored answers from your actual resume and projects.
        </p>
        <div className="mt-4">
          <Link
            to="/profile"
            className="focus-ring inline-flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-teal-800"
          >
            Go to Profile & Upload Resume
          </Link>
        </div>
      </div>
    );
  }

  if (type === 'extraction_failed') {
    return (
      <div className="rounded-md border border-slate-200 bg-slate-50 p-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 text-slate-700">
          <AlertCircle size={24} />
        </div>
        <h3 className="mt-3 text-base font-semibold text-ink">We couldn&apos;t extract enough text from this resume</h3>
        <p className="mt-1 text-sm text-slate-600">
          The uploaded file might be a scanned image. Please upload a text-readable PDF from your Profile.
        </p>
        <div className="mt-4">
          <Link
            to="/profile"
            className="focus-ring inline-flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-teal-800"
          >
            Manage Resumes
          </Link>
        </div>
      </div>
    );
  }

  if (type === 'error') {
    const isRateLimit = errorMessage?.toLowerCase().includes('busy') || errorMessage?.toLowerCase().includes('rate');
    const isConfig = errorMessage?.toLowerCase().includes('configured');
    const isTimeout = errorMessage?.toLowerCase().includes('timed out');
    const isValidation = errorMessage?.toLowerCase().includes('select') || errorMessage?.toLowerCase().includes('role');

    const errorTitle = isRateLimit
      ? 'AI Service Temporarily Busy'
      : isConfig
      ? 'Placement AI Configuration Error'
      : isTimeout
      ? 'Request Timed Out'
      : isValidation
      ? 'Missing Configuration'
      : 'Unable to Generate Questions';

    return (
      <div className="rounded-md border border-rose-200 bg-rose-50 p-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-700">
          <AlertCircle size={24} />
        </div>
        <h3 className="mt-3 text-base font-semibold text-rose-900">{errorTitle}</h3>
        <p className="mt-1 text-sm text-rose-700">
          {errorMessage || 'We encountered an issue communicating with the AI service. Please check your connection and try again.'}
        </p>
        {onRetry && (
          <div className="mt-4">
            <button
              onClick={onRetry}
              className="focus-ring inline-flex items-center gap-2 rounded-md bg-rose-700 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-rose-800"
            >
              <RefreshCw size={16} /> Try Again
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-brand">
        <Sparkles size={24} />
      </div>
      <h3 className="mt-3 text-base font-semibold text-ink">No Interview Questions Generated Yet</h3>
      <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
        Configure your target role and company above, then click &ldquo;Generate Questions&rdquo; to start practicing with resume-grounded AI questions.
      </p>
    </div>
  );
};
