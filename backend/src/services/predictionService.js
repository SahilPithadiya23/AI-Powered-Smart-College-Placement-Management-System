export const calculatePlacementProbability = (student) => {
  const cgpaScore = Math.min((student.cgpa || 0) * 7, 70);
  const skillsScore = Math.min((student.skills?.length || 0) * 3, 15);
  const projectScore = Math.min((student.projects?.length || 0) * 4, 8);
  const certScore = Math.min((student.certifications?.length || 0) * 2, 5);
  const internshipScore = student.internships?.length ? 2 : 0;
  return Math.min(Math.round(cgpaScore + skillsScore + projectScore + certScore + internshipScore), 100);
};
