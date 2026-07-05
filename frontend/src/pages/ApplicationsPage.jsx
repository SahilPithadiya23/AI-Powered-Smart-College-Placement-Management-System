import { useEffect, useState } from 'react';
import { CalendarPlus, CheckCircle2, Download, FileText } from 'lucide-react';
import { useSelector } from 'react-redux';
import { api } from '../services/api.js';
import { Timeline } from '../components/Timeline.jsx';

const statusDepth = {
  applied: 1,
  under_review: 2,
  shortlisted: 2,
  interview_scheduled: 3,
  selected: 5,
  rejected: 5,
  offer_released: 6
};

const tabs = [
  ['applied', 'Applied'],
  ['under_review', 'Under Review'],
  ['shortlisted', 'Shortlisted'],
  ['rejected', 'Rejected'],
  ['selected', 'Selected']
];

const recruiterActions = [
  ['under_review', 'Review'],
  ['shortlisted', 'Shortlist'],
  ['interview_scheduled', 'Next Round'],
  ['selected', 'Select'],
  ['rejected', 'Reject']
];

export const ApplicationsPage = () => {
  const user = useSelector((state) => state.auth.user);
  const [applications, setApplications] = useState([]);
  const [activeTab, setActiveTab] = useState('applied');

  const loadApplications = () => {
    api.get('/applications').then(({ data }) => setApplications(data.applications));
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const updateStatus = async (application, status) => {
    await api.patch(`/applications/${application._id}/status`, { status });
    loadApplications();
  };

  const visibleApplications = user?.role === 'student'
    ? applications.filter((application) => {
        if (activeTab === 'selected') return ['selected', 'offer_released'].includes(application.status);
        return application.status === activeTab;
      })
    : applications;

  return (
    <div className="space-y-4">
      {user?.role === 'student' && (
        <div className="flex gap-2 overflow-x-auto rounded-md border border-slate-200 bg-white p-2">
          {tabs.map(([status, label]) => (
            <button
              key={status}
              onClick={() => setActiveTab(status)}
              className={`focus-ring whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium ${activeTab === status ? 'bg-brand text-white' : 'text-slate-700 hover:bg-slate-100'}`}
            >
              {label}
            </button>
          ))}
        </div>
      )}
      {visibleApplications.length === 0 && (
        <section className="rounded-md border border-slate-200 bg-white p-5 text-sm text-slate-600">
          No applications found in this view.
        </section>
      )}
      {visibleApplications.map((application) => (
        <article key={application._id} className="rounded-md border border-slate-200 bg-white p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-semibold text-ink">{application.job?.title}</h2>
              <p className="text-sm text-slate-500">{application.job?.company?.name} - ATS {application.atsScore || 0}%</p>
              {user?.role !== 'student' && (
                <p className="mt-1 text-sm text-slate-600">
                  {application.student?.name} - {application.studentProfile?.usn || 'USN not set'} - CGPA {application.studentProfile?.cgpa || 0}
                </p>
              )}
            </div>
            <span className="rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">{application.status}</span>
          </div>
          <div className="mt-5">
            <Timeline active={statusDepth[application.status] || 1} />
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <div className="rounded-md bg-emerald-50 p-3">
              <p className="flex items-center gap-2 text-sm font-medium text-brand"><CheckCircle2 size={16} /> Matching Skills</p>
              <p className="mt-1 text-sm text-slate-600">{application.matchingSkills?.join(', ') || 'No matches yet'}</p>
            </div>
            <div className="rounded-md bg-orange-50 p-3">
              <p className="flex items-center gap-2 text-sm font-medium text-accent"><CalendarPlus size={16} /> Missing Skills</p>
              <p className="mt-1 text-sm text-slate-600">{application.missingSkills?.join(', ') || 'No gaps detected'}</p>
            </div>
          </div>
          {user?.role !== 'student' && (
            <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
              <span className={`rounded px-2 py-1 text-xs font-medium ${application.eligibilityStatus === 'Eligible' ? 'bg-emerald-50 text-brand' : 'bg-red-50 text-red-700'}`}>
                {application.eligibilityStatus}
              </span>
              <span className="text-sm text-slate-600">Skills: {application.studentProfile?.skills?.join(', ') || 'Not added'}</span>
              {application.resume?.fileUrl && (
                <a href={application.resume.fileUrl} target="_blank" rel="noreferrer" className="focus-ring inline-flex items-center gap-1 rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700">
                  <Download size={15} /> Resume
                </a>
              )}
              {recruiterActions.map(([status, label]) => (
                <button
                  key={status}
                  onClick={() => updateStatus(application, status)}
                  className={`focus-ring inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium ${status === 'rejected' ? 'bg-red-600 text-white' : 'bg-brand text-white'}`}
                >
                  {status === 'interview_scheduled' ? <CalendarPlus size={15} /> : <FileText size={15} />}
                  {label}
                </button>
              ))}
            </div>
          )}
        </article>
      ))}
    </div>
  );
};
