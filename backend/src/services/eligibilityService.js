import { Student } from '../models/Student.js';
import { Job } from '../models/Job.js';

export const checkEligibility = async ({ studentUserId, jobId }) => {
  const [student, job] = await Promise.all([
    Student.findOne({ user: studentUserId }),
    Job.findById(jobId)
  ]);

  if (!student) return { eligible: false, reasons: ['Student profile not found'] };
  if (!job || job.status !== 'active') return { eligible: false, reasons: ['Job is not active'] };

  const reasons = [];
  if (job.allowedBranches?.length && !job.allowedBranches.includes(student.branch)) {
    reasons.push(`Branch ${student.branch || 'not set'} is not eligible`);
  }
  if ((student.cgpa || 0) < job.minimumCgpa) reasons.push(`Minimum CGPA required is ${job.minimumCgpa}`);
  if ((student.backlogs || 0) > job.maximumBacklogs) reasons.push(`Maximum backlogs allowed is ${job.maximumBacklogs}`);
  if (job.graduationYear && student.graduationYear !== job.graduationYear) {
    reasons.push(`Graduation year must be ${job.graduationYear}`);
  }
  const studentSkills = new Set((student.skills || []).map((skill) => skill.toLowerCase()));
  const missingSkills = (job.requiredSkills || []).filter((skill) => !studentSkills.has(skill.toLowerCase()));
  missingSkills.forEach((skill) => reasons.push(`Required skill ${skill} is missing`));

  return { eligible: reasons.length === 0, reasons, student, job };
};
