export const generateInterviewQuestions = ({ role, company, skills = [] }) => {
  const technical = skills.slice(0, 5).map((skill) => `Explain a project where you used ${skill}.`);
  return {
    technical: technical.length ? technical : [`What core concepts are most important for a ${role} role?`],
    hr: [
      'Tell me about yourself.',
      'Describe a time you handled a difficult deadline.',
      'Why should we hire you for this role?'
    ],
    companySpecific: [
      `What do you know about ${company || 'this company'}?`,
      `How would you create value for ${company || 'the hiring team'} in your first 90 days?`
    ]
  };
};
