import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CalendarDays, Gauge, Trophy } from 'lucide-react';
import { fetchDashboard, fetchFeed, fetchNotifications } from '../store/appSlice.js';
import { StatCard } from '../components/StatCard.jsx';
import { JobCard } from '../components/JobCard.jsx';

const dashboardLabels = {
  student: ['Profile Completion %', 'Jobs Applied', 'Interviews Scheduled', 'Offers Received', 'Saved Jobs', 'Placement Probability Score'],
  recruiter: ['Total Jobs Posted', 'Total Applicants', 'Active Jobs', 'Closed Jobs', 'Shortlisted Candidates', 'Offers Released'],
  placement_officer: ['Total Students', 'Total Recruiters', 'Total Jobs', 'Placement Percentage', 'Highest Package', 'Average Package'],
  admin: ['Total Users', 'Active Sessions', 'Audit Logs', 'Job Statistics', 'Platform Health', 'System Analytics']
};

const getDashboardValues = (role, stats) => {
  if (role === 'student') {
    return [
      stats.profileCompletion || 0,
      stats.applications || 0,
      stats.interviews || 0,
      stats.offers || 0,
      stats.savedJobs || 0,
      stats.placementProbability || 0
    ];
  }
  if (role === 'recruiter') {
    return [
      stats.totalJobsPosted || 0,
      stats.totalApplications || 0,
      stats.activeJobs || 0,
      stats.closedJobs || 0,
      stats.shortlistedCandidates || 0,
      stats.offersReleased || 0
    ];
  }
  return [
    stats.totalStudents || stats.totalUsers || 0,
    stats.totalRecruiters || 0,
    stats.totalJobs || 0,
    stats.placementPercentage || 0,
    stats.highestPackage || 0,
    stats.averagePackage || 0
  ];
};

export const DashboardPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { stats, feed, notifications } = useSelector((state) => state.app);

  useEffect(() => {
    dispatch(fetchDashboard());
    dispatch(fetchFeed());
    dispatch(fetchNotifications());
  }, [dispatch]);

  const labels = dashboardLabels[user?.role] || dashboardLabels.student;
  const values = getDashboardValues(user?.role, stats);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {labels.map((label, index) => (
          <StatCard key={label} label={label} value={values[index]} tone={index % 2 ? 'accent' : 'brand'} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <Gauge size={20} className="text-brand" />
            <h2 className="text-lg font-semibold text-ink">Active Hiring Feed</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {(feed.recentJobs || []).slice(0, 4).map((job) => <JobCard key={job._id} job={job} />)}
          </div>
          <div className="mt-6">
            <div className="mb-3 flex items-center gap-2">
              <CalendarDays size={20} className="text-accent" />
              <h2 className="text-lg font-semibold text-ink">Upcoming Recruitment Drives</h2>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {(feed.closingSoonJobs || []).slice(0, 4).map((job) => (
                <div key={job._id} className="rounded-md border border-slate-200 bg-white p-4">
                  <p className="font-medium text-ink">{job.title}</p>
                  <p className="text-sm text-slate-500">{job.company?.name || 'Company'} closes {job.closingDate ? new Date(job.closingDate).toLocaleDateString() : 'soon'}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <aside className="space-y-4">
          <div className="rounded-md border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2">
              <CalendarDays size={18} className="text-brand" />
              <h2 className="font-semibold text-ink">Recent Notifications</h2>
            </div>
            <div className="mt-3 space-y-3">
              {notifications.slice(0, 5).map((item) => (
                <div key={item._id} className="border-b border-slate-100 pb-3 last:border-0">
                  <p className="text-sm font-medium text-ink">{item.title}</p>
                  <p className="text-sm text-slate-500">{item.message}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-md border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2">
              <Trophy size={18} className="text-accent" />
              <h2 className="font-semibold text-ink">Placement Probability</h2>
            </div>
            <div className="mt-4 h-3 rounded-full bg-slate-100">
              <div className="h-3 rounded-full bg-brand" style={{ width: `${Math.min(stats.placementProbability || 72, 100)}%` }} />
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
};
