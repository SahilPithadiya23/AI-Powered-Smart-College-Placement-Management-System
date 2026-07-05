import { Student } from '../models/Student.js';
import { Recruiter } from '../models/Recruiter.js';
import { Company } from '../models/Company.js';
import { Resume } from '../models/Resume.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ROLES } from '../utils/constants.js';
import { calculatePlacementProbability } from '../services/predictionService.js';
import { parseResume } from '../services/atsService.js';

export const getProfile = asyncHandler(async (req, res) => {
  const Model = req.user.role === ROLES.RECRUITER ? Recruiter : Student;
  const profile = await Model.findOne({ user: req.user._id }).populate('company');
  res.json({ success: true, profile });
});

export const updateStudentProfile = asyncHandler(async (req, res) => {
  const update = { ...req.body };
  if (req.file) update.profilePhoto = req.file.path;
  update.placementProbability = calculatePlacementProbability(update);
  const profile = await Student.findOneAndUpdate({ user: req.user._id }, update, {
    new: true,
    upsert: true,
    runValidators: true
  });
  res.json({ success: true, profile });
});

export const upsertCompany = asyncHandler(async (req, res) => {
  const payload = { ...req.body, recruiter: req.user._id };
  if (req.file) payload.logo = req.file.path;
  const company = await Company.findOneAndUpdate({ recruiter: req.user._id }, payload, {
    new: true,
    upsert: true,
    runValidators: true
  });
  await Recruiter.findOneAndUpdate({ user: req.user._id }, { company: company._id }, { upsert: true });
  res.json({ success: true, company });
});

export const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError('Resume file is required', 400);

  if (req.body.isDefault === 'true') {
    await Resume.updateMany({ student: req.user._id }, { isDefault: false });
  }

  const resume = await Resume.create({
    student: req.user._id,
    label: req.body.label || req.file.originalname,
    fileUrl: req.file.path,
    isDefault: req.body.isDefault === 'true',
    parsed: parseResume(req.file.originalname)
  });

  res.status(201).json({ success: true, resume });
});

export const listResumes = asyncHandler(async (req, res) => {
  const resumes = await Resume.find({ student: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, resumes });
});

export const setDefaultResume = asyncHandler(async (req, res) => {
  await Resume.updateMany({ student: req.user._id }, { isDefault: false });
  const resume = await Resume.findOneAndUpdate(
    { _id: req.params.id, student: req.user._id },
    { isDefault: true },
    { new: true }
  );
  if (!resume) throw new AppError('Resume not found', 404);
  res.json({ success: true, resume });
});

export const deleteResume = asyncHandler(async (req, res) => {
  const resume = await Resume.findOneAndDelete({ _id: req.params.id, student: req.user._id });
  if (!resume) throw new AppError('Resume not found', 404);
  res.json({ success: true, message: 'Resume deleted' });
});
