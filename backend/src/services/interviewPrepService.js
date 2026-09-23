import { User } from '../models/User.js';
import { Student } from '../models/Student.js';
import { Resume } from '../models/Resume.js';
import { reparseResumeIfIncomplete } from './resumeParserService.js';
import {
  generateQuestionsAI,
  evaluateAnswerAI,
  generateFollowUpsAI,
  chatWithCoachAI
} from './aiService.js';

/**
 * Normalizes an array of skills (lowercased comparison, deduplicated, preserves display casing)
 */
const normalizeSkills = (...skillLists) => {
  const map = new Map();
  for (const list of skillLists) {
    if (Array.isArray(list)) {
      for (const item of list) {
        if (typeof item === 'string' && item.trim()) {
          const clean = item.trim();
          const key = clean.toLowerCase();
          if (!map.has(key)) {
            map.set(key, clean);
          }
        }
      }
    }
  }
  return Array.from(map.values()).slice(0, 30);
};

/**
 * Builds a compact, structured interview context object from student & resume
 */
export const buildStudentInterviewContext = (user, student, resume) => {
  const profileSkills = student?.skills || [];
  const resumeSkills = resume?.parsed?.skills || [];
  const combinedSkills = normalizeSkills(profileSkills, resumeSkills);

  // Projects from both profile and resume
  const profileProjects = (student?.projects || []).map((p) => ({
    title: (p.title || '').trim().slice(0, 80),
    description: (p.description || '').trim().slice(0, 300),
    technologies: Array.isArray(p.techStack) ? p.techStack.slice(0, 6) : []
  })).filter((p) => Boolean(p.title));

  const resumeProjects = (resume?.parsed?.projects || []).map((p) => {
    if (typeof p === 'string') {
      return { title: p.slice(0, 80), description: '', technologies: [] };
    }
    return {
      title: (p.title || '').trim().slice(0, 80),
      description: (p.description || '').trim().slice(0, 300),
      technologies: Array.isArray(p.technologies) ? p.technologies.slice(0, 6) : []
    };
  }).filter((p) => Boolean(p.title));

  // Merge projects avoiding duplicates by lowercase title
  const projectMap = new Map();
  [...resumeProjects, ...profileProjects].forEach((p) => {
    const key = p.title.toLowerCase();
    if (!projectMap.has(key)) projectMap.set(key, p);
  });
  const projects = Array.from(projectMap.values()).slice(0, 5);

  // Experience / Internships
  const profileInternships = (student?.internships || []).map((i) => ({
    company: i.company || '',
    role: i.role || '',
    duration: i.duration || '',
    description: ''
  }));

  const resumeExperience = (resume?.parsed?.experience || []).map((e) => ({
    company: e.company || '',
    role: e.role || '',
    duration: e.duration || '',
    description: (e.description || '').slice(0, 200)
  }));

  const experience = [...resumeExperience, ...profileInternships].filter((e) => Boolean(e.company || e.role)).slice(0, 4);

  // Certifications
  const certifications = Array.from(
    new Set([...(student?.certifications || []), ...(resume?.parsed?.certifications || [])])
  ).filter(Boolean).slice(0, 6);

  // Education
  const education = (resume?.parsed?.education || []).slice(0, 4);

  return {
    student: {
      name: user?.name || 'Candidate',
      branch: student?.branch || '',
      cgpa: student?.cgpa ?? '',
      graduationYear: student?.graduationYear ?? '',
      skills: combinedSkills
    },
    resume: {
      summary: (resume?.parsed?.summary || '').slice(0, 400),
      skills: resumeSkills.slice(0, 20),
      education,
      projects,
      experience,
      certifications,
      achievements: (resume?.parsed?.achievements || []).slice(0, 4)
    }
  };
};

/**
 * Retrieves the student profile, default resume (auto-reparsing if incomplete), and readiness status
 */
export const getStudentInterviewContext = async (userId) => {
  const user = await User.findById(userId).select('-password');
  const student = await Student.findOne({ user: userId });

  // Find default resume or fallback to most recent resume
  let resume = await Resume.findOne({ student: userId, isDefault: true });
  if (!resume) {
    resume = await Resume.findOne({ student: userId }).sort({ createdAt: -1 });
  }

  // If resume is found, ensure it is re-parsed if legacy/incomplete
  if (resume) {
    resume = await reparseResumeIfIncomplete(resume);
  }

  const context = buildStudentInterviewContext(user, student, resume);

  const hasResume = Boolean(resume);
  const totalSkillsCount = context.student.skills.length;
  const totalProjectsCount = context.resume.projects.length;

  const contextReadiness = {
    hasResume,
    resumeName: resume?.label || (resume ? 'Default Resume' : null),
    hasParsedSkills: totalSkillsCount > 0,
    hasParsedProjects: totalProjectsCount > 0,
    isComplete: hasResume && totalSkillsCount > 0,
    totalSkillsCount,
    totalProjectsCount,
    profileAvailableFields: {
      name: Boolean(user?.name),
      branch: Boolean(student?.branch),
      cgpa: Boolean(student?.cgpa),
      graduationYear: Boolean(student?.graduationYear),
      skills: totalSkillsCount > 0,
      projects: totalProjectsCount > 0,
      certifications: context.resume.certifications.length > 0
    }
  };

  return {
    user,
    student,
    resume,
    context,
    contextReadiness
  };
};

/**
 * Generate resume-driven questions via AI
 */
export const generatePrepQuestions = async (userId, { role, company, questionType, difficulty, count }) => {
  const { context } = await getStudentInterviewContext(userId);
  return generateQuestionsAI({
    studentContext: context,
    role: role || 'Software Engineer',
    company: company || '',
    questionType: questionType || 'all',
    difficulty: difficulty || 'mixed',
    count: Number(count) || 10
  });
};

/**
 * Evaluate a student's practice answer
 */
export const evaluatePracticeAnswer = async (userId, { question, studentAnswer, role, company }) => {
  const { context } = await getStudentInterviewContext(userId);
  return evaluateAnswerAI({
    studentContext: context,
    question,
    studentAnswer,
    role,
    company
  });
};

/**
 * Generate follow-up questions
 */
export const generateQuestionFollowUps = async (userId, { question, studentAnswer, role, company }) => {
  const { context } = await getStudentInterviewContext(userId);
  return generateFollowUpsAI({
    studentContext: context,
    question,
    previousAnswer: studentAnswer,
    role,
    company
  });
};

/**
 * Handle AI Placement Coach chatbot messages
 */
export const handleCoachChat = async (userId, { messages, context: activeContext }) => {
  const { context } = await getStudentInterviewContext(userId);
  return chatWithCoachAI({
    studentContext: context,
    messages: messages || [],
    activeContext: activeContext || {}
  });
};
