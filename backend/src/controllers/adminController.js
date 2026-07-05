import { User } from '../models/User.js';
import { Student } from '../models/Student.js';
import { Recruiter } from '../models/Recruiter.js';
import { Job } from '../models/Job.js';
import { Company } from '../models/Company.js';
import { Application } from '../models/Application.js';
import { Offer } from '../models/Offer.js';
import { Announcement } from '../models/Announcement.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { approveRecruiter } from '../services/jobService.js';
import { createNotification } from '../services/notificationService.js';

export const adminSummary = asyncHandler(async (_req, res) => {
  const [totalStudents, totalRecruiters, totalJobs, totalApplications, selectedApplications, offers] = await Promise.all([
    User.countDocuments({ role: 'student' }),
    User.countDocuments({ role: 'recruiter' }),
    Job.countDocuments(),
    Application.countDocuments(),
    Application.countDocuments({ status: { $in: ['selected', 'offer_released'] } }),
    Offer.find().populate('job')
  ]);

  const packages = offers.map((offer) => offer.package || offer.job?.package || 0).filter(Boolean);
  res.json({
    success: true,
    summary: {
      totalStudents,
      totalRecruiters,
      totalJobs,
      totalApplications,
      placementPercentage: totalStudents ? Math.round((selectedApplications / totalStudents) * 100) : 0,
      highestPackage: packages.length ? Math.max(...packages) : 0,
      averagePackage: packages.length ? Number((packages.reduce((sum, value) => sum + value, 0) / packages.length).toFixed(2)) : 0
    }
  });
});

export const listUsers = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.q) {
    filter.$or = [
      { name: new RegExp(req.query.q, 'i') },
      { email: new RegExp(req.query.q, 'i') }
    ];
  }
  const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
  res.json({ success: true, users });
});

export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).select('-password');
  if (!user) throw new AppError('User not found', 404);
  res.json({ success: true, user });
});

export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw new AppError('User not found', 404);
  await Promise.all([
    Student.findOneAndDelete({ user: req.params.id }),
    Recruiter.findOneAndDelete({ user: req.params.id }),
    Company.findOneAndDelete({ recruiter: req.params.id })
  ]);
  res.json({ success: true, message: 'User deleted' });
});

export const approveRecruiterAccount = asyncHandler(async (req, res) => {
  const user = await approveRecruiter(req.params.id);
  if (!user) throw new AppError('Recruiter not found', 404);
  res.json({ success: true, user });
});

export const approveCompany = asyncHandler(async (req, res) => {
  const company = await Company.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
  if (!company) throw new AppError('Company not found', 404);
  res.json({ success: true, company });
});

export const publishAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.create({ ...req.body, publishedBy: req.user._id });
  const students = await User.find({ role: 'student' }).select('_id');
  await Promise.all(
    students.map((student) =>
      createNotification({
        recipient: student._id,
        title: announcement.title,
        message: announcement.message,
        type: 'announcement',
        metadata: { announcement: announcement._id }
      })
    )
  );
  res.status(201).json({ success: true, announcement });
});

export const listJobs = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  const jobs = await Job.find(filter).populate('company recruiter', 'name email location').sort({ createdAt: -1 });
  res.json({ success: true, jobs });
});

export const closeJob = asyncHandler(async (req, res) => {
  const job = await Job.findByIdAndUpdate(req.params.id, { status: 'closed' }, { new: true });
  if (!job) throw new AppError('Job not found', 404);
  res.json({ success: true, job });
});

export const deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findByIdAndDelete(req.params.id);
  if (!job) throw new AppError('Job not found', 404);
  await Application.deleteMany({ job: req.params.id });
  res.json({ success: true, message: 'Job deleted' });
});

export const listApplications = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.student) filter.student = req.query.student;
  if (req.query.company) {
    const jobs = await Job.find({ company: req.query.company }).select('_id');
    filter.job = { $in: jobs.map((job) => job._id) };
  }
  const applications = await Application.find(filter)
    .populate('student', 'name email')
    .populate({ path: 'job', populate: { path: 'company' } })
    .populate('resume')
    .sort({ createdAt: -1 });
  res.json({ success: true, applications });
});

export const reports = asyncHandler(async (_req, res) => {
  const [students, selectedApplications, offers, companyStats] = await Promise.all([
    User.countDocuments({ role: 'student' }),
    Application.find({ status: { $in: ['selected', 'offer_released'] } }).populate({ path: 'job', populate: { path: 'company' } }),
    Offer.find().populate({ path: 'job', populate: { path: 'company' } }),
    Application.aggregate([
      { $lookup: { from: 'jobs', localField: 'job', foreignField: '_id', as: 'job' } },
      { $unwind: '$job' },
      { $group: { _id: '$job.company', applications: { $sum: 1 }, selected: { $sum: { $cond: [{ $in: ['$status', ['selected', 'offer_released']] }, 1, 0] } } } },
      { $lookup: { from: 'companies', localField: '_id', foreignField: '_id', as: 'company' } },
      { $unwind: '$company' },
      { $project: { company: '$company.name', applications: 1, selected: 1 } },
      { $sort: { applications: -1 } }
    ])
  ]);

  const packages = offers.map((offer) => offer.package || offer.job?.package || 0).filter(Boolean);
  res.json({
    success: true,
    report: {
      placementPercentage: students ? Math.round((selectedApplications.length / students) * 100) : 0,
      studentsPlaced: new Set(selectedApplications.map((application) => application.student.toString())).size,
      averagePackage: packages.length ? Number((packages.reduce((sum, value) => sum + value, 0) / packages.length).toFixed(2)) : 0,
      highestPackage: packages.length ? Math.max(...packages) : 0,
      companyStats
    }
  });
});

export const studentAnalysis = asyncHandler(async (_req, res) => {
  const [students, activeJobs] = await Promise.all([
    Student.find().populate('user', 'name email isActive createdAt').sort({ createdAt: -1 }),
    Job.find({ status: 'active' }).select('title allowedBranches minimumCgpa maximumBacklogs graduationYear requiredSkills')
  ]);

  const analyzedStudents = students.map((student) => {
    const eligibleJobs = activeJobs.filter((job) => {
      const branchOk = !job.allowedBranches?.length || job.allowedBranches.includes(student.branch);
      const cgpaOk = (student.cgpa || 0) >= (job.minimumCgpa || 0);
      const backlogOk = (student.backlogs || 0) <= (job.maximumBacklogs || 0);
      const yearOk = !job.graduationYear || student.graduationYear === job.graduationYear;
      return branchOk && cgpaOk && backlogOk && yearOk;
    });

    return {
      id: student._id,
      userId: student.user?._id,
      name: student.user?.name || 'Unnamed student',
      email: student.user?.email,
      branch: student.branch || 'Not set',
      cgpa: student.cgpa || 0,
      backlogs: student.backlogs || 0,
      graduationYear: student.graduationYear || 'Not set',
      skillsCount: student.skills?.length || 0,
      placementProbability: student.placementProbability || 0,
      eligibleJobsCount: eligibleJobs.length,
      eligibleJobs: eligibleJobs.slice(0, 5).map((job) => job.title)
    };
  });

  const eligibleStudents = analyzedStudents.filter((student) => student.eligibleJobsCount > 0);
  const branchSummary = analyzedStudents.reduce((summary, student) => {
    summary[student.branch] = (summary[student.branch] || 0) + 1;
    return summary;
  }, {});

  res.json({
    success: true,
    summary: {
      registeredStudents: analyzedStudents.length,
      eligibleStudents: eligibleStudents.length,
      activeJobs: activeJobs.length,
      averageCgpa: analyzedStudents.length
        ? Number((analyzedStudents.reduce((sum, student) => sum + student.cgpa, 0) / analyzedStudents.length).toFixed(2))
        : 0,
      branchSummary
    },
    students: analyzedStudents
  });
});
