import { Sparkles, Loader2, CheckCircle2 } from 'lucide-react';

const roleOptions = [
  'Software Engineer',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Data Analyst',
  'AI/ML Engineer',
  'DevOps Engineer',
  'Mobile App Developer'
];

const companySuggestions = ['TCS', 'Infosys', 'Deloitte', 'Google', 'Amazon', 'Microsoft', 'Accenture', 'Startup'];

export const InterviewConfig = ({
  config,
  onChange,
  onGenerate,
  generating,
  generationStage
}) => {
  const handleChange = (field, value) => {
    onChange({ ...config, [field]: value });
  };

  const getButtonContent = () => {
    if (generationStage === 'analyzing') {
      return (
        <>
          <Loader2 size={16} className="animate-spin" />
          <span>Analyzing Resume...</span>
        </>
      );
    }
    if (generationStage === 'generating') {
      return (
        <>
          <Loader2 size={16} className="animate-spin" />
          <span>Generating Questions...</span>
        </>
      );
    }
    if (generationStage === 'ready') {
      return (
        <>
          <CheckCircle2 size={16} />
          <span>Questions Ready</span>
        </>
      );
    }
    return (
      <>
        <Sparkles size={16} />
        <span>Generate Questions</span>
      </>
    );
  };

  return (
    <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-ink">Interview Configuration</h3>
      <p className="mt-0.5 text-xs text-slate-500">
        Customize the target placement role, company, and question categories.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onGenerate();
        }}
        className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5"
      >
        {/* Target Role */}
        <div className="lg:col-span-1">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
            Target Role *
          </label>
          <input
            type="text"
            list="roles-list"
            required
            value={config.role}
            onChange={(e) => handleChange('role', e.target.value)}
            placeholder="e.g. Software Engineer"
            className="focus-ring mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-ink placeholder:text-slate-400"
          />
          <datalist id="roles-list">
            {roleOptions.map((r) => (
              <option key={r} value={r} />
            ))}
          </datalist>
        </div>

        {/* Target Company */}
        <div className="lg:col-span-1">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
            Target Company (Optional)
          </label>
          <input
            type="text"
            list="companies-list"
            value={config.company}
            onChange={(e) => handleChange('company', e.target.value)}
            placeholder="e.g. Deloitte, TCS"
            className="focus-ring mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-ink placeholder:text-slate-400"
          />
          <datalist id="companies-list">
            {companySuggestions.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>

        {/* Question Type */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
            Question Type
          </label>
          <select
            value={config.questionType}
            onChange={(e) => handleChange('questionType', e.target.value)}
            className="focus-ring mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-ink"
          >
            <option value="all">All (Balanced)</option>
            <option value="technical">Technical Fundamentals</option>
            <option value="resume_based">Resume & Profile Grounded</option>
            <option value="project_based">Project Deep Dives</option>
            <option value="behavioral">Behavioral / HR</option>
            <option value="company_specific">Company Specific</option>
          </select>
        </div>

        {/* Difficulty */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
            Difficulty
          </label>
          <select
            value={config.difficulty}
            onChange={(e) => handleChange('difficulty', e.target.value)}
            className="focus-ring mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-ink"
          >
            <option value="mixed">Mixed (Recommended)</option>
            <option value="easy">Easy (Entry / Basics)</option>
            <option value="medium">Medium (Standard)</option>
            <option value="hard">Hard (Advanced / In-depth)</option>
          </select>
        </div>

        {/* Number of Questions */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
            Count
          </label>
          <select
            value={config.count}
            onChange={(e) => handleChange('count', Number(e.target.value))}
            className="focus-ring mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-ink"
          >
            <option value={5}>5 Questions</option>
            <option value={10}>10 Questions</option>
            <option value={15}>15 Questions</option>
            <option value={20}>20 Questions</option>
          </select>
        </div>

        {/* Action Button */}
        <div className="flex items-end sm:col-span-2 lg:col-span-5">
          <button
            type="submit"
            disabled={generating}
            className="focus-ring inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-brand px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-400 sm:w-auto"
          >
            {getButtonContent()}
          </button>
        </div>
      </form>
    </div>
  );
};
