import { useEffect, useMemo, useState } from 'react';
import { BriefcaseBusiness, Building2, ClipboardList, Pencil, ShieldCheck, Upload, UsersRound } from 'lucide-react';
import { useSelector } from 'react-redux';
import { api } from '../services/api.js';
import { StatCard } from '../components/StatCard.jsx';

const emptyJob = {
  title: '',
  companyName: '',
  location: '',
  package: '',
  openDate: '',
  closingDate: '',
  requiredSkills: '',
  roundsConducted: '',
  allowedBranches: '',
  minimumCgpa: '',
  maximumBacklogs: '',
  graduationYear: '',
  workMode: 'onsite',
  jobType: 'full_time',
  description: ''
};

const skillOptions = ['Java', 'Python', 'SQL', 'MongoDB', 'Node.js', 'React.js', 'JavaScript', 'DSA', 'C++', 'Machine Learning'];
const roundOptions = ['Aptitude Test', 'Technical Round', 'Coding Round', 'Group Discussion', 'HR Round'];

const getApiError = (error) => error.response?.data?.message || error.message || 'Request failed';

const TextInput = ({ label, value, onChange, type = 'text', placeholder, required = false }) => (
  <label className="text-sm font-medium text-slate-700">
    {label}
    <input
      type={type}
      required={required}
      className="focus-ring mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
      value={value || ''}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
    />
  </label>
);

const splitList = (value) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const MultiSelect = ({ label, options, value = [], onChange }) => {
  const selected = new Set(value);
  const toggle = (option) => {
    const next = new Set(selected);
    if (next.has(option)) next.delete(option);
    else next.add(option);
    onChange([...next]);
  };

  return (
    <fieldset className="text-sm font-medium text-slate-700">
      <legend>{label}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => (
          <label key={option} className={`focus-within:ring-brand inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm ${selected.has(option) ? 'border-brand bg-emerald-50 text-brand' : 'border-slate-200 text-slate-700'}`}>
            <input type="checkbox" className="h-4 w-4 accent-emerald-600" checked={selected.has(option)} onChange={() => toggle(option)} />
            {option}
          </label>
        ))}
      </div>
    </fieldset>
  );
};

const hasStudentProfileData = (profile = {}) =>
  ['phone', 'usn', 'branch', 'cgpa', 'backlogs', 'graduationYear', 'linkedin', 'github', 'portfolio'].some((field) => Boolean(profile[field])) ||
  (profile.skills || []).length > 0;

const profileCompletion = (profile = {}) => {
  const fields = ['usn', 'branch', 'cgpa', 'backlogs', 'graduationYear', 'skills'];
  const completed = fields.filter((field) => (Array.isArray(profile[field]) ? profile[field].length : profile[field] !== undefined && profile[field] !== '')).length;
  return Math.round((completed / fields.length) * 100);
};

const StudentProfile = ({ user, profile, setProfile }) => {
  const [resumes, setResumes] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const hasSavedProfile = hasStudentProfileData(profile);

  useEffect(() => {
    api.get('/profiles/resumes').then(({ data }) => setResumes(data.resumes));
  }, []);

  const saveStudent = async (event) => {
    event.preventDefault();
    const { data } = await api.put('/profiles/student', profile);
    setProfile(data.profile);
    setIsEditing(false);
  };

  const uploadResume = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('isDefault', resumes.length === 0 ? 'true' : 'false');
    const { data } = await api.post('/profiles/resumes', formData);
    setResumes([data.resume, ...resumes]);
  };

  const profileRows = [
    ['Name', user?.name],
    ['Email', user?.email],
    ['Phone', profile.phone],
    ['USN', profile.usn],
    ['Branch', profile.branch],
    ['CGPA', profile.cgpa],
    ['Backlogs', profile.backlogs],
    ['Graduation Year', profile.graduationYear],
    ['LinkedIn', profile.linkedin],
    ['GitHub', profile.github],
    ['Portfolio', profile.portfolio],
    ['Skills', (profile.skills || []).join(', ')]
  ];

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      {hasSavedProfile && !isEditing ? (
        <section className="rounded-md border border-slate-200 bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-ink">Student Profile</h2>
              <p className="text-sm text-slate-500">Profile completion: {profileCompletion(profile)}%</p>
            </div>
            <button onClick={() => setIsEditing(true)} className="focus-ring inline-flex items-center gap-2 rounded-md bg-brand px-4 py-2 font-medium text-white">
              <Pencil size={16} /> Edit
            </button>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {profileRows.map(([label, value]) => (
              <div key={label} className="rounded-md bg-slate-50 px-3 py-2">
                <p className="text-xs font-medium uppercase text-slate-500">{label}</p>
                <p className="mt-1 text-sm text-ink">{value || 'Not added'}</p>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <form onSubmit={saveStudent} className="rounded-md border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-ink">Student Profile</h2>
          <p className="mt-1 text-sm text-slate-500">Profile completion: {profileCompletion(profile)}%</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {['phone', 'usn', 'branch', 'cgpa', 'backlogs', 'graduationYear', 'linkedin', 'github', 'portfolio'].map((field) => (
              <TextInput key={field} label={field} value={profile[field]} onChange={(value) => setProfile({ ...profile, [field]: value })} />
            ))}
          </div>
          <div className="mt-4">
            <MultiSelect label="Skills" options={skillOptions} value={profile.skills || []} onChange={(skills) => setProfile({ ...profile, skills })} />
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button className="focus-ring rounded-md bg-brand px-4 py-2 font-medium text-white">Save profile</button>
            {hasSavedProfile && (
              <button type="button" onClick={() => setIsEditing(false)} className="focus-ring rounded-md border border-slate-200 px-4 py-2 font-medium text-slate-700">
                Cancel
              </button>
            )}
          </div>
        </form>
      )}
      <aside className="rounded-md border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-ink">Resume Management</h2>
        <label className="focus-ring mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-slate-300 p-5 text-sm font-medium text-slate-700">
          <Upload size={18} /> Upload PDF
          <input type="file" accept="application/pdf" className="hidden" onChange={uploadResume} />
        </label>
        <div className="mt-4 space-y-3">
          {resumes.map((resume) => (
            <div key={resume._id} className="rounded-md border border-slate-200 p-3">
              <p className="font-medium text-ink">{resume.label}</p>
              <p className="text-sm text-slate-500">{resume.isDefault ? 'Default resume' : 'Versioned resume'}</p>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
};

const RecruiterWorkspace = ({ profile, setProfile }) => {
  const [job, setJob] = useState(emptyJob);
  const [companyStatus, setCompanyStatus] = useState({ type: '', text: '' });
  const [jobStatus, setJobStatus] = useState({ type: '', text: '' });
  const [savingCompany, setSavingCompany] = useState(false);
  const [postingJob, setPostingJob] = useState(false);

  const saveCompanyDetails = async () => {
    const { data } = await api.put('/profiles/company', {
      name: profile.company?.name || job.companyName,
      location: profile.company?.location || job.location,
      website: profile.company?.website,
      description: profile.company?.description,
      hiringDetails: profile.company?.hiringDetails
    });
    setProfile({ ...profile, company: data.company });
    return data.company;
  };

  const saveCompany = async (event) => {
    event.preventDefault();
    setSavingCompany(true);
    setCompanyStatus({ type: '', text: '' });

    try {
      await saveCompanyDetails();
      setCompanyStatus({ type: 'success', text: 'Company profile saved.' });
    } catch (error) {
      setCompanyStatus({ type: 'error', text: getApiError(error) });
    } finally {
      setSavingCompany(false);
    }
  };

  const postJob = async (event) => {
    event.preventDefault();
    setPostingJob(true);
    setJobStatus({ type: '', text: '' });

    try {
      if (!profile.company?._id) {
        await saveCompanyDetails();
      }

      await api.post('/jobs', {
        title: job.title,
        description: job.description,
        package: Number(job.package || 0),
        location: job.location,
        openDate: job.openDate,
        closingDate: job.closingDate,
        requiredSkills: Array.isArray(job.requiredSkills) ? job.requiredSkills : splitList(job.requiredSkills),
        roundsConducted: Array.isArray(job.roundsConducted) ? job.roundsConducted : splitList(job.roundsConducted),
        allowedBranches: splitList(job.allowedBranches),
        minimumCgpa: Number(job.minimumCgpa || 0),
        maximumBacklogs: Number(job.maximumBacklogs || 0),
        graduationYear: job.graduationYear ? Number(job.graduationYear) : undefined,
        workMode: job.workMode,
        jobType: job.jobType
      });
      setJob(emptyJob);
      setJobStatus({ type: 'success', text: 'Job posted successfully. It is now visible in the Jobs page.' });
    } catch (error) {
      setJobStatus({ type: 'error', text: getApiError(error) });
    } finally {
      setPostingJob(false);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
      <form onSubmit={saveCompany} className="rounded-md border border-slate-200 bg-white p-5">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-ink"><Building2 size={20} /> Company Details</h2>
        <div className="mt-4 space-y-4">
          <TextInput label="Company name" required value={profile.company?.name || ''} onChange={(value) => setProfile({ ...profile, company: { ...profile.company, name: value } })} />
          <TextInput label="Location" required value={profile.company?.location || ''} onChange={(value) => setProfile({ ...profile, company: { ...profile.company, location: value } })} />
          <TextInput label="Website" value={profile.company?.website || ''} onChange={(value) => setProfile({ ...profile, company: { ...profile.company, website: value } })} />
          <label className="block text-sm font-medium text-slate-700">
            Company description
            <textarea className="focus-ring mt-1 h-28 w-full rounded-md border border-slate-300 px-3 py-2" value={profile.company?.description || ''} onChange={(event) => setProfile({ ...profile, company: { ...profile.company, description: event.target.value } })} />
          </label>
          <button disabled={savingCompany} className="focus-ring rounded-md bg-brand px-4 py-2 font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-400">
            {savingCompany ? 'Saving...' : 'Save company'}
          </button>
          {companyStatus.text && (
            <p className={`text-sm ${companyStatus.type === 'error' ? 'text-red-600' : 'text-brand'}`}>{companyStatus.text}</p>
          )}
        </div>
      </form>

      <form onSubmit={postJob} className="rounded-md border border-slate-200 bg-white p-5">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-ink"><BriefcaseBusiness size={20} /> Post Job</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <TextInput label="Role" required value={job.title} onChange={(value) => setJob({ ...job, title: value })} />
          <TextInput label="Company name" required value={profile.company?.name || job.companyName} onChange={(value) => setJob({ ...job, companyName: value })} />
          <TextInput label="Location" required value={job.location} onChange={(value) => setJob({ ...job, location: value })} />
          <TextInput label="Package" required value={job.package} onChange={(value) => setJob({ ...job, package: value })} placeholder="Example: 8" />
          <TextInput label="Recruitment start date" type="date" value={job.openDate} onChange={(value) => setJob({ ...job, openDate: value })} />
          <TextInput label="Recruitment end date" required type="date" value={job.closingDate} onChange={(value) => setJob({ ...job, closingDate: value })} />
          <div className="md:col-span-2">
            <MultiSelect label="Required skills" options={skillOptions} value={Array.isArray(job.requiredSkills) ? job.requiredSkills : splitList(job.requiredSkills)} onChange={(requiredSkills) => setJob({ ...job, requiredSkills })} />
          </div>
          <div className="md:col-span-2">
            <MultiSelect label="Recruitment rounds" options={roundOptions} value={Array.isArray(job.roundsConducted) ? job.roundsConducted : splitList(job.roundsConducted)} onChange={(roundsConducted) => setJob({ ...job, roundsConducted })} />
          </div>
          <TextInput label="Allowed branches" value={job.allowedBranches} onChange={(value) => setJob({ ...job, allowedBranches: value })} placeholder="CSE, ISE, ECE" />
          <TextInput label="Minimum CGPA" value={job.minimumCgpa} onChange={(value) => setJob({ ...job, minimumCgpa: value })} />
          <TextInput label="Maximum backlogs" value={job.maximumBacklogs} onChange={(value) => setJob({ ...job, maximumBacklogs: value })} />
          <TextInput label="Graduation year" value={job.graduationYear} onChange={(value) => setJob({ ...job, graduationYear: value })} />
        </div>
        <label className="mt-4 block text-sm font-medium text-slate-700">
          Small description about the role
          <textarea required className="focus-ring mt-1 h-28 w-full rounded-md border border-slate-300 px-3 py-2" value={job.description} onChange={(event) => setJob({ ...job, description: event.target.value })} />
        </label>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button disabled={postingJob} className="focus-ring rounded-md bg-brand px-4 py-2 font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-400">
            {postingJob ? 'Posting...' : 'Post job'}
          </button>
          {jobStatus.text && (
            <p className={`text-sm ${jobStatus.type === 'error' ? 'text-red-600' : 'text-brand'}`}>{jobStatus.text}</p>
          )}
        </div>
      </form>
    </div>
  );
};

const PlacementOfficerWorkspace = () => {
  const [analysis, setAnalysis] = useState({ summary: {}, students: [] });

  useEffect(() => {
    api.get('/admin/students/analysis').then(({ data }) => setAnalysis(data));
  }, []);

  const branchRows = useMemo(() => Object.entries(analysis.summary.branchSummary || {}), [analysis]);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Registered Students" value={analysis.summary.registeredStudents} />
        <StatCard label="Eligible Students" value={analysis.summary.eligibleStudents} tone="accent" />
        <StatCard label="Active Jobs" value={analysis.summary.activeJobs} />
        <StatCard label="Average CGPA" value={analysis.summary.averageCgpa} tone="accent" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="rounded-md border border-slate-200 bg-white p-5">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-ink"><UsersRound size={20} /> Student Eligibility Analysis</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-slate-200 text-slate-500">
                <tr><th className="py-2">Student</th><th>Branch</th><th>CGPA</th><th>Backlogs</th><th>Eligible Jobs</th><th>Probability</th></tr>
              </thead>
              <tbody>
                {analysis.students.map((student) => (
                  <tr key={student.id} className="border-b border-slate-100">
                    <td className="py-3"><span className="font-medium text-ink">{student.name}</span><br /><span className="text-slate-500">{student.email}</span></td>
                    <td>{student.branch}</td>
                    <td>{student.cgpa}</td>
                    <td>{student.backlogs}</td>
                    <td>{student.eligibleJobsCount}</td>
                    <td>{student.placementProbability}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <aside className="rounded-md border border-slate-200 bg-white p-5">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-ink"><ClipboardList size={20} /> Branch Summary</h2>
          <div className="mt-4 space-y-3">
            {branchRows.map(([branch, count]) => (
              <div key={branch} className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2 text-sm">
                <span className="font-medium text-slate-700">{branch}</span>
                <span className="text-ink">{count}</span>
              </div>
            ))}
          </div>
        </aside>
      </section>
    </div>
  );
};

const AdminWorkspace = () => (
  <div className="rounded-md border border-slate-200 bg-white p-5">
    <h2 className="flex items-center gap-2 text-lg font-semibold text-ink"><ShieldCheck size={20} /> Admin Access</h2>
    <div className="mt-4 grid gap-4 md:grid-cols-3">
      <StatCard label="User Management" value="Full" />
      <StatCard label="System Settings" value="Full" tone="accent" />
      <StatCard label="Audit and Analytics" value="Full" />
    </div>
    <p className="mt-4 text-sm text-slate-600">
      Admin controls are available from the Admin section: user management, recruiter approvals, announcements, audit visibility, and platform oversight.
    </p>
  </div>
);

export const ProfilePage = () => {
  const user = useSelector((state) => state.auth.user);
  const [profile, setProfile] = useState({});

  useEffect(() => {
    api.get('/profiles/me').then(({ data }) => setProfile(data.profile || {}));
  }, []);

  if (user?.role === 'recruiter') return <RecruiterWorkspace profile={profile} setProfile={setProfile} />;
  if (user?.role === 'placement_officer') return <PlacementOfficerWorkspace />;
  if (user?.role === 'admin') return <AdminWorkspace />;
  return <StudentProfile user={user} profile={profile} setProfile={setProfile} />;
};
