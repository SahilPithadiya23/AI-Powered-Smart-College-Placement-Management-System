import { Job } from '../models/Job.js';
import { Student } from '../models/Student.js';
import { User } from '../models/User.js';
import { createNotification } from './notificationService.js';
import { logActivity } from './auditService.js';

export const searchJobs = (query) => {
  const filter = {};
  if (query.status) filter.status = query.status;
  if (query.company) filter.company = query.company;
  if (query.location) filter.location = new RegExp(query.location, 'i');
  if (query.workMode) filter.workMode = query.workMode;
  if (query.branch) filter.allowedBranches = query.branch;
  if (query.skill) filter.requiredSkills = new RegExp(query.skill, 'i');
  if (query.q) filter.$text = { $search: query.q };
  if (query.deadline) filter.closingDate = { $lte: new Date(query.deadline) };
  if (query.minPackage || query.maxPackage) {
    filter.package = {};
    if (query.minPackage) filter.package.$gte = Number(query.minPackage);
    if (query.maxPackage) filter.package.$lte = Number(query.maxPackage);
  }

  return Job.find(filter).populate('company recruiter', 'name email logo location').sort({ createdAt: -1 });
};

export const notifyMatchingStudents = async (job) => {
  const students = await Student.find({}).populate('user', 'email name');

  await Promise.all(
    students.map((student) =>
      createNotification({
        recipient: student.user._id,
        title: `    ${job.company.name} - Campus Placement Drive`,
        message: `${job.title} at ${job.company.name} 
        the description is ${job.description} and the package is ${job.package} `,
        type: 'job',
        metadata: { job: job._id },
        email: { to: student.user.email }
      })
    )
  );
};

export const expireOldJobs = async () => {
  const result = await Job.updateMany(
    { status: 'active', closingDate: { $lt: new Date() } },
    { $set: { status: 'expired' } }
  );
  return result.modifiedCount;
};

export const createJobWithNotifications = async ({ req, data }) => {
  const job = await Job.create(data);
  await job.populate('company', 'name');
  await logActivity({ req, actor: data.recruiter, action: 'job.create', entity: 'Job', entityId: job._id });
  await notifyMatchingStudents(job);
  return job;
};

export const approveRecruiter = async (userId) =>
  User.findByIdAndUpdate(userId, { recruiterApproved: true }, { new: true }).select('-password');
