import { useEffect, useState } from 'react';
import { Megaphone, Search, ShieldCheck, Trash2, XCircle } from 'lucide-react';
import { api } from '../services/api.js';
import { StatCard } from '../components/StatCard.jsx';

export const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [summary, setSummary] = useState({});
  const [report, setReport] = useState({ companyStats: [] });
  const [filters, setFilters] = useState({ role: '', q: '', status: '' });
  const [appFilters, setAppFilters] = useState({ status: '', student: '', company: '' });
  const [announcement, setAnnouncement] = useState({ title: '', message: '', category: 'drive' });

  const loadAdmin = () => {
    api.get('/admin/users', { params: { role: filters.role, q: filters.q } }).then(({ data }) => setUsers(data.users));
    api.get('/admin/jobs', { params: { status: filters.status } }).then(({ data }) => setJobs(data.jobs));
    api.get('/admin/applications', { params: appFilters }).then(({ data }) => setApplications(data.applications));
    api.get('/admin/summary').then(({ data }) => setSummary(data.summary));
    api.get('/admin/reports').then(({ data }) => setReport(data.report));
  };

  const loadJobsByStatus = (status) => {
    api.get('/admin/jobs', { params: { status } }).then(({ data }) => setJobs(data.jobs));
  };

  const loadApplications = (event) => {
    event.preventDefault();
    api.get('/admin/applications', { params: appFilters }).then(({ data }) => setApplications(data.applications));
  };

  useEffect(() => {
    loadAdmin();
  }, []);

  const publish = async (event) => {
    event.preventDefault();
    await api.post('/admin/announcements', announcement);
    setAnnouncement({ title: '', message: '', category: 'drive' });
  };

  const updateUser = async (user, payload) => {
    await api.patch(`/admin/users/${user._id}`, payload);
    loadAdmin();
  };

  const approveRecruiter = async (user) => {
    await api.patch(`/admin/recruiters/${user._id}/approve`);
    loadAdmin();
  };

  const deleteUser = async (user) => {
    if (!window.confirm(`Delete ${user.name}?`)) return;
    await api.delete(`/admin/users/${user._id}`);
    loadAdmin();
  };

  const closeJob = async (job) => {
    await api.patch(`/admin/jobs/${job._id}/close`);
    loadAdmin();
  };

  const deleteJob = async (job) => {
    if (!window.confirm(`Delete ${job.title}?`)) return;
    await api.delete(`/admin/jobs/${job._id}`);
    loadAdmin();
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Students" value={summary.totalStudents || 0} />
        <StatCard label="Recruiters" value={summary.totalRecruiters || 0} tone="accent" />
        <StatCard label="Jobs" value={summary.totalJobs || 0} />
        <StatCard label="Applications" value={summary.totalApplications || 0} tone="accent" />
        <StatCard label="Placement %" value={summary.placementPercentage || 0} />
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <section className="rounded-md border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-ink">User Management</h2>
          <form onSubmit={(event) => { event.preventDefault(); loadAdmin(); }} className="flex flex-wrap gap-2">
            <input className="focus-ring rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="Search student/recruiter" value={filters.q} onChange={(event) => setFilters({ ...filters, q: event.target.value })} />
            <select className="focus-ring rounded-md border border-slate-300 px-3 py-2 text-sm" value={filters.role} onChange={(event) => setFilters({ ...filters, role: event.target.value })}>
              <option value="">All roles</option>
              <option value="student">Students</option>
              <option value="recruiter">Recruiters</option>
              <option value="placement_officer">Placement officers</option>
              <option value="admin">Admins</option>
            </select>
            <button className="focus-ring inline-flex items-center gap-1 rounded-md bg-brand px-3 py-2 text-sm font-medium text-white"><Search size={15} /> Search</button>
          </form>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500">
              <tr><th className="py-2">Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-b border-slate-100">
                  <td className="py-3 font-medium text-ink">{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>{user.isActive ? 'Active' : 'Disabled'}{user.role === 'recruiter' ? ` / ${user.recruiterApproved ? 'Approved' : 'Pending'}` : ''}</td>
                  <td className="flex flex-wrap gap-2 py-2">
                    {user.role === 'recruiter' && !user.recruiterApproved && (
                      <button onClick={() => approveRecruiter(user)} className="focus-ring inline-flex items-center gap-1 rounded-md bg-brand px-2 py-1 text-xs font-medium text-white"><ShieldCheck size={14} /> Approve</button>
                    )}
                    <button onClick={() => updateUser(user, { isActive: !user.isActive })} className="focus-ring inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-xs font-medium text-slate-700"><XCircle size={14} /> {user.isActive ? 'Disable' : 'Enable'}</button>
                    <button onClick={() => deleteUser(user)} className="focus-ring inline-flex items-center gap-1 rounded-md bg-red-600 px-2 py-1 text-xs font-medium text-white"><Trash2 size={14} /> Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <form onSubmit={publish} className="rounded-md border border-slate-200 bg-white p-5">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-ink"><Megaphone size={19} /> Announcement</h2>
        <input className="focus-ring mt-4 w-full rounded-md border border-slate-300 px-3 py-2" placeholder="Title" value={announcement.title} onChange={(e) => setAnnouncement({ ...announcement, title: e.target.value })} />
        <textarea className="focus-ring mt-3 h-32 w-full rounded-md border border-slate-300 px-3 py-2" placeholder="Message" value={announcement.message} onChange={(e) => setAnnouncement({ ...announcement, message: e.target.value })} />
        <button className="focus-ring mt-3 rounded-md bg-brand px-4 py-2 font-medium text-white">Publish</button>
      </form>
      </div>

      <section className="rounded-md border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-ink">Job Management</h2>
          <select
            className="focus-ring rounded-md border border-slate-300 px-3 py-2 text-sm"
            value={filters.status}
            onChange={(event) => {
              setFilters({ ...filters, status: event.target.value });
              loadJobsByStatus(event.target.value);
            }}
          >
            <option value="">All jobs</option>
            <option value="active">Active</option>
            <option value="closed">Closed</option>
            <option value="expired">Expired</option>
          </select>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500">
              <tr><th className="py-2">Role</th><th>Company</th><th>Status</th><th>Applicants</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job._id} className="border-b border-slate-100">
                  <td className="py-3 font-medium text-ink">{job.title}</td>
                  <td>{job.company?.name || 'Company'}</td>
                  <td>{job.status}</td>
                  <td>{job.applicationsCount || 0}</td>
                  <td className="flex gap-2 py-2">
                    <button onClick={() => closeJob(job)} className="focus-ring rounded-md border border-slate-200 px-2 py-1 text-xs font-medium text-slate-700">Close</button>
                    <button onClick={() => deleteJob(job)} className="focus-ring rounded-md bg-red-600 px-2 py-1 text-xs font-medium text-white">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="rounded-md border border-slate-200 bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-ink">Applications Management</h2>
            <form onSubmit={loadApplications} className="flex flex-wrap gap-2">
              <select className="focus-ring rounded-md border border-slate-300 px-3 py-2 text-sm" value={appFilters.status} onChange={(event) => setAppFilters({ ...appFilters, status: event.target.value })}>
                <option value="">All statuses</option>
                <option value="applied">Applied</option>
                <option value="under_review">Under Review</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="rejected">Rejected</option>
                <option value="selected">Selected</option>
              </select>
              <input className="focus-ring rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="Student user ID" value={appFilters.student} onChange={(event) => setAppFilters({ ...appFilters, student: event.target.value })} />
              <input className="focus-ring rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="Company ID" value={appFilters.company} onChange={(event) => setAppFilters({ ...appFilters, company: event.target.value })} />
              <button className="focus-ring inline-flex items-center gap-1 rounded-md bg-brand px-3 py-2 text-sm font-medium text-white"><Search size={15} /> Filter</button>
            </form>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-slate-200 text-slate-500">
                <tr><th className="py-2">Student</th><th>Company</th><th>Role</th><th>Status</th></tr>
              </thead>
              <tbody>
                {applications.map((application) => (
                  <tr key={application._id} className="border-b border-slate-100">
                    <td className="py-3 font-medium text-ink">{application.student?.name}</td>
                    <td>{application.job?.company?.name}</td>
                    <td>{application.job?.title}</td>
                    <td>{application.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <aside className="rounded-md border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-ink">Reports</h2>
          <div className="mt-4 grid gap-3">
            <StatCard label="Students Placed" value={report.studentsPlaced || 0} />
            <StatCard label="Highest Package" value={report.highestPackage || 0} tone="accent" />
            <StatCard label="Average Package" value={report.averagePackage || 0} />
          </div>
          <div className="mt-4 space-y-2">
            {(report.companyStats || []).slice(0, 5).map((row) => (
              <div key={row.company} className="rounded-md bg-slate-50 px-3 py-2 text-sm">
                <p className="font-medium text-ink">{row.company}</p>
                <p className="text-slate-500">{row.applications} applications / {row.selected} selected</p>
              </div>
            ))}
          </div>
        </aside>
      </section>
    </div>
  );
};
