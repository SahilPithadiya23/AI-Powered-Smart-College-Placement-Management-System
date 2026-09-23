import { env } from '../config/env.js';

const normalize = (items = []) => items.map((item) => item.toLowerCase().trim()).filter(Boolean);

const fallbackAnalysis = ({ resume, student, job }) => {
  const candidateSkills = new Set(normalize([...(resume?.parsed?.skills || []), ...(student?.skills || [])]));
  const requiredSkills = normalize(job.requiredSkills || []);
  const matchingSkills = requiredSkills.filter((skill) => candidateSkills.has(skill));
  const missingSkills = requiredSkills.filter((skill) => !candidateSkills.has(skill));
  const atsScore = requiredSkills.length ? Math.round((matchingSkills.length / requiredSkills.length) * 100) : 100;
  const matchVerdict = atsScore >= 85 ? 'strong_match' : atsScore >= 70 ? 'good_match' : atsScore >= 45 ? 'partial_match' : 'low_match';

  return {
    atsScore,
    matchingSkills,
    missingSkills,
    matchVerdict,
    matchSummary: requiredSkills.length
      ? `Matched ${matchingSkills.length} of ${requiredSkills.length} required skills.`
      : 'No required skills were listed for this job.',
    matchSuggestions: missingSkills.map((skill) => `Add a project, certification, or resume bullet demonstrating ${skill}.`),
    verificationProvider: 'local'
  };
};

const flattenProjects = (projects = []) =>
  projects.map((project) => ({
    title: project.title,
    description: project.description,
    techStack: project.techStack || []
  }));

const buildPrompt = ({ resume, student, job }) => ({
  role: 'user',
  content: JSON.stringify({
    task: 'Verify whether this student resume/profile matches the recruiter job tech stack and description. Return only valid JSON.',
    expectedJsonShape: {
      atsScore: 'number from 0 to 100',
      matchVerdict: 'one of strong_match, good_match, partial_match, low_match',
      matchSummary: 'one concise sentence',
      matchingSkills: ['skills present in candidate profile/resume and relevant to the job'],
      missingSkills: ['important required skills not found'],
      matchSuggestions: ['short actionable improvements for the candidate resume']
    },
    recruiterNeed: {
      title: job.title,
      description: job.description,
      requiredSkills: job.requiredSkills || [],
      workMode: job.workMode,
      jobType: job.jobType
    },
    candidateResume: {
      label: resume?.label,
      parsedSkills: resume?.parsed?.skills || [],
      parsedEducation: resume?.parsed?.education || [],
      parsedProjects: resume?.parsed?.projects || [],
      parsedCertifications: resume?.parsed?.certifications || []
    },
    candidateProfile: {
      branch: student?.branch,
      cgpa: student?.cgpa,
      skills: student?.skills || [],
      certifications: student?.certifications || [],
      projects: flattenProjects(student?.projects || []),
      internships: student?.internships || []
    }
  })
});

const parseGroqJson = (content) => {
  const jsonText = content.match(/\{[\s\S]*\}/)?.[0] || content;
  return JSON.parse(jsonText);
};

const cleanGroqAnalysis = (analysis) => {
  const atsScore = Math.max(0, Math.min(100, Math.round(Number(analysis.atsScore) || 0)));
  const allowedVerdicts = ['strong_match', 'good_match', 'partial_match', 'low_match'];

  return {
    atsScore,
    matchVerdict: allowedVerdicts.includes(analysis.matchVerdict) ? analysis.matchVerdict : 'partial_match',
    matchSummary: String(analysis.matchSummary || 'Resume verification completed.').slice(0, 300),
    matchingSkills: Array.isArray(analysis.matchingSkills) ? analysis.matchingSkills.map(String).slice(0, 20) : [],
    missingSkills: Array.isArray(analysis.missingSkills) ? analysis.missingSkills.map(String).slice(0, 20) : [],
    matchSuggestions: Array.isArray(analysis.matchSuggestions) ? analysis.matchSuggestions.map(String).slice(0, 8) : [],
    verificationProvider: 'groq'
  };
};

const analyzeWithGroq = async ({ resume, student, job }) => {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.groq.apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: env.groq.model,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'You are an ATS resume verifier for a college placement system. Score fit only from supplied candidate data and job requirements. Do not invent skills.'
        },
        buildPrompt({ resume, student, job })
      ]
    })
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Groq verification failed: ${message}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('Groq verification returned an empty response.');

  return cleanGroqAnalysis(parseGroqJson(content));
};

export const analyzeResumeForJob = async ({ resume, student, job }) => {
  if (!env.groq.apiKey) return fallbackAnalysis({ resume, student, job });

  try {
    return await analyzeWithGroq({ resume, student, job });
  } catch (error) {
    const fallback = fallbackAnalysis({ resume, student, job });
    return {
      ...fallback,
      matchSummary: `${fallback.matchSummary} AI verification was unavailable, so local skill matching was used.`,
      verificationProvider: 'local'
    };
  }
};

export const parseResume = (filename) => ({
  skills: filename
    .replace(/\.[^.]+$/, '')
    .split(/[-_\s]+/)
    .filter((word) => word.length > 2)
    .slice(0, 8),
  education: [],
  projects: [],
  certifications: []
});
