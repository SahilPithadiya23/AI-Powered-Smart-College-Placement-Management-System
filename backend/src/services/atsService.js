const normalize = (items = []) => items.map((item) => item.toLowerCase().trim()).filter(Boolean);

export const analyzeResumeForJob = ({ resume, student, job }) => {
  const candidateSkills = new Set(normalize([...(resume?.parsed?.skills || []), ...(student?.skills || [])]));
  const requiredSkills = normalize(job.requiredSkills || []);
  const matchingSkills = requiredSkills.filter((skill) => candidateSkills.has(skill));
  const missingSkills = requiredSkills.filter((skill) => !candidateSkills.has(skill));
  const atsScore = requiredSkills.length ? Math.round((matchingSkills.length / requiredSkills.length) * 100) : 100;

  return {
    atsScore,
    matchingSkills,
    missingSkills,
    suggestions: missingSkills.map((skill) => `Add a project, certification, or bullet demonstrating ${skill}.`)
  };
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
