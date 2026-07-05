import { Job } from '../models/Job.js';
import { SavedJob } from '../models/SavedJob.js';
import { Company } from '../models/Company.js';
import { Application } from '../models/Application.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createJobWithNotifications, searchJobs } from '../services/jobService.js';
import { checkEligibility } from '../services/eligibilityService.js';
import { ROLES } from '../utils/constants.js';

export const listJobs = asyncHandler(async (req, res) => {
  const jobs = await searchJobs(req.query);
  if (req.user?.role !== ROLES.STUDENT) {
    res.json({ success: true, jobs });
    return;
  }

  const applications = await Application.find({
    student: req.user._id,
    job: { $in: jobs.map((job) => job._id) }
  }).select('job status');
  const applicationByJobId = new Map(applications.map((application) => [application.job.toString(), application]));

  res.json({
    success: true,
    jobs: jobs.map((job) => {
      const application = applicationByJobId.get(job._id.toString());
      return {
        ...job.toObject(),
        applicationStatus: application?.status,
        applicationId: application?._id
      };
    })
  });
});

export const hiringFeed = asyncHandler(async (_req, res) => {
  const [recentJobs, closingSoonJobs, activeCompanies, trendingJobs] = await Promise.all([
    Job.find({ status: 'active' }).populate('company').sort({ createdAt: -1 }).limit(8),
    Job.find({ status: 'active' }).populate('company').sort({ closingDate: 1 }).limit(8),
    Company.find({ isApproved: true }).sort({ createdAt: -1 }).limit(8),
    Job.find({ status: 'active' }).populate('company').sort({ applicationsCount: -1 }).limit(8)
  ]);
  res.json({ success: true, recentJobs, closingSoonJobs, activeCompanies, trendingJobs });
});

export const createJob = asyncHandler(async (req, res) => {
  const company = await Company.findOne({ recruiter: req.user._id });
  if (!company) throw new AppError('Create a company profile before posting jobs', 400);

  const job = await createJobWithNotifications({
    req,
    data: { ...req.body, recruiter: req.user._id, company: company._id }
  });
  res.status(201).json({ success: true, job });
});

export const updateJob = asyncHandler(async (req, res) => {
  const job = await Job.findOneAndUpdate({ _id: req.params.id, recruiter: req.user._id }, req.body, {
    new: true,
    runValidators: true
  });
  if (!job) throw new AppError('Job not found', 404);
  res.json({ success: true, job });
});

export const closeJob = asyncHandler(async (req, res) => {
  const job = await Job.findOneAndUpdate(
    { _id: req.params.id, recruiter: req.user._id },
    { status: 'closed' },
    { new: true }
  );
  if (!job) throw new AppError('Job not found', 404);
  res.json({ success: true, job });
});

export const saveJob = asyncHandler(async (req, res) => {
  const savedJob = await SavedJob.findOneAndUpdate(
    { student: req.user._id, job: req.params.id },
    { student: req.user._id, job: req.params.id },
    { upsert: true, new: true }
  );
  res.status(201).json({ success: true, savedJob });
});

export const removeSavedJob = asyncHandler(async (req, res) => {
  await SavedJob.findOneAndDelete({ student: req.user._id, job: req.params.id });
  res.json({ success: true, message: 'Saved job removed' });
});

export const listSavedJobs = asyncHandler(async (req, res) => {
  const savedJobs = await SavedJob.find({ student: req.user._id }).populate({
    path: 'job',
    populate: { path: 'company' }
  });
  res.json({ success: true, savedJobs });
});

export const eligibility = asyncHandler(async (req, res) => {
  const result = await checkEligibility({ studentUserId: req.user._id, jobId: req.params.id });
  res.json({ success: true, ...result });
});
