import { Application } from '../models/Application.js';
import { Job } from '../models/Job.js';
import { Resume } from '../models/Resume.js';
import { Student } from '../models/Student.js';
import { Interview } from '../models/Interview.js';
import { Offer } from '../models/Offer.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { checkEligibility } from '../services/eligibilityService.js';
import { analyzeResumeForJob } from '../services/atsService.js';
import { createNotification } from '../services/notificationService.js';

export const applyForJob = asyncHandler(async (req, res) => {
  const existingApplication = await Application.findOne({ student: req.user._id, job: req.params.jobId });
  if (existingApplication) {
    res.json({ success: true, application: existingApplication, alreadyApplied: true });
    return;
  }

  const eligibility = await checkEligibility({ studentUserId: req.user._id, jobId: req.params.jobId });
  if (!eligibility.eligible) throw new AppError(`You are not eligible because ${eligibility.reasons.join(', ')}.`, 400);

  const resume = req.body.resumeId
    ? await Resume.findOne({ _id: req.body.resumeId, student: req.user._id })
    : await Resume.findOne({ student: req.user._id, isDefault: true });
  const ats = analyzeResumeForJob({ resume, student: eligibility.student, job: eligibility.job });

  const application = await Application.create({
    student: req.user._id,
    job: req.params.jobId,
    resume: resume?._id,
    history: [{ status: 'applied', actor: req.user._id, note: 'Application submitted' }],
    ...ats
  });

  await Job.findByIdAndUpdate(req.params.jobId, { $inc: { applicationsCount: 1 } });
  await createNotification({
    recipient: eligibility.job.recruiter,
    title: 'New application received',
    message: `${req.user.name} applied for ${eligibility.job.title}.`,
    type: 'application',
    metadata: { application: application._id }
  });

  res.status(201).json({ success: true, application, ats });
});

export const listApplications = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.user.role === 'student') filter.student = req.user._id;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.student) filter.student = req.query.student;

  if (req.user.role === 'recruiter') {
    const recruiterJobs = await Job.find({ recruiter: req.user._id }).select('_id');
    filter.job = { $in: recruiterJobs.map((job) => job._id) };
  }
  if (req.query.job) filter.job = req.query.job;

  const applications = await Application.find(filter)
    .populate({ path: 'job', populate: { path: 'company' } })
    .populate('student', 'name email')
    .populate('resume')
    .sort({ createdAt: -1 });

  const studentProfiles = await Student.find({
    user: { $in: applications.map((application) => application.student?._id).filter(Boolean) }
  });
  const profileByUserId = new Map(studentProfiles.map((profile) => [profile.user.toString(), profile]));

  const enrichedApplications = applications.map((application) => {
    const record = application.toObject();
    const profile = profileByUserId.get(application.student?._id?.toString());
    record.studentProfile = profile;
    record.eligibilityStatus = application.missingSkills?.length ? 'Not Eligible' : 'Eligible';
    return record;
  });

  res.json({ success: true, applications: enrichedApplications });
});

export const updateApplicationStatus = asyncHandler(async (req, res) => {
  const application = await Application.findByIdAndUpdate(
    req.params.id,
    {
      status: req.body.status,
      $push: { history: { status: req.body.status, note: req.body.note, actor: req.user._id } }
    },
    { new: true, runValidators: true }
  ).populate('student job');
  if (!application) throw new AppError('Application not found', 404);

  if (req.body.status === 'shortlisted') await Job.findByIdAndUpdate(application.job._id, { $inc: { shortlistedCount: 1 } });
  if (req.body.status === 'selected') await Job.findByIdAndUpdate(application.job._id, { $inc: { offersCount: 1 } });

  await createNotification({
    recipient: application.student._id,
    title: 'Application status updated',
    message: `Your application for ${application.job.title} is now ${req.body.status}.`,
    type: 'application',
    metadata: { application: application._id }
  });

  res.json({ success: true, application });
});

export const scheduleInterview = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id).populate('job student');
  if (!application) throw new AppError('Application not found', 404);

  const interview = await Interview.create({
    ...req.body,
    application: application._id,
    job: application.job._id,
    student: application.student._id,
    recruiter: req.user._id
  });

  application.status = 'interview_scheduled';
  application.history.push({ status: 'interview_scheduled', note: 'Interview scheduled', actor: req.user._id });
  await application.save();

  await createNotification({
    recipient: application.student._id,
    title: 'Interview scheduled',
    message: `Interview scheduled for ${application.job.title}.`,
    type: 'interview',
    metadata: { interview: interview._id }
  });

  res.status(201).json({ success: true, interview });
});

export const releaseOffer = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id).populate('job student');
  if (!application) throw new AppError('Application not found', 404);

  const offer = await Offer.create({
    ...req.body,
    application: application._id,
    student: application.student._id,
    job: application.job._id,
    recruiter: req.user._id
  });

  await Promise.all([
    Job.findByIdAndUpdate(application.job._id, { $inc: { offersCount: 1 } }),
    Application.findByIdAndUpdate(application._id, {
      status: 'offer_released',
      $push: { history: { status: 'offer_released', note: 'Offer released', actor: req.user._id } }
    }),
    createNotification({
      recipient: application.student._id,
      title: 'Offer released',
      message: `You received an offer for ${application.job.title}.`,
      type: 'offer',
      metadata: { offer: offer._id }
    })
  ]);

  res.status(201).json({ success: true, offer });
});

export const respondToOffer = asyncHandler(async (req, res) => {
  const offer = await Offer.findOneAndUpdate(
    { _id: req.params.id, student: req.user._id },
    { status: req.body.status },
    { new: true }
  );
  if (!offer) throw new AppError('Offer not found', 404);
  res.json({ success: true, offer });
});
