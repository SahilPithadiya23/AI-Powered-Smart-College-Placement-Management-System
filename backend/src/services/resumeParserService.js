import fs from 'fs';
import path from 'path';
import PDFParser from 'pdf2json';

// Common technical skills catalog for robust regex matching in resumes
const KNOWN_SKILLS = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Golang', 'Rust', 'PHP', 'Ruby', 'Swift', 'Kotlin',
  'React', 'React.js', 'Next.js', 'Vue', 'Vue.js', 'Angular', 'Svelte', 'HTML', 'HTML5', 'CSS', 'CSS3', 'Tailwind CSS', 'Bootstrap',
  'Node.js', 'Express', 'Express.js', 'NestJS', 'Django', 'Flask', 'FastAPI', 'Spring Boot', 'ASP.NET', 'Laravel',
  'MongoDB', 'PostgreSQL', 'MySQL', 'SQLite', 'Redis', 'Cassandra', 'Oracle', 'Firebase', 'Supabase', 'DynamoDB',
  'REST', 'RESTful APIs', 'GraphQL', 'gRPC', 'WebSockets', 'Microservices',
  'Git', 'GitHub', 'GitLab', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'CI/CD', 'Jenkins', 'Linux', 'Nginx',
  'Machine Learning', 'Deep Learning', 'Data Science', 'TensorFlow', 'PyTorch', 'scikit-learn', 'Pandas', 'NumPy', 'OpenCV', 'NLP',
  'DSA', 'Data Structures', 'Algorithms', 'OOP', 'DBMS', 'Operating Systems', 'Computer Networks',
  'Agile', 'Scrum', 'Jira', 'Unit Testing', 'Jest', 'Mocha', 'Postman'
];

/**
 * Extract raw text from a PDF file using pdf2json
 * @param {string} filePath - Absolute or relative path to PDF file
 * @returns {Promise<string>} - Extracted text content
 */
export const extractTextFromPdf = (filePath) =>
  new Promise((resolve, reject) => {
    try {
      if (!fs.existsSync(filePath)) {
        return reject(new Error(`PDF file does not exist at path: ${filePath}`));
      }

      const pdfParser = new PDFParser(null, 1);

      const timer = setTimeout(() => {
        try {
          pdfParser.destroy();
        } catch {
          // ignore cleanup error
        }
        reject(new Error('PDF extraction timed out after 15 seconds.'));
      }, 15000);

      pdfParser.on('pdfParser_dataError', (errData) => {
        clearTimeout(timer);
        reject(new Error(errData?.parserError || 'Failed to parse PDF binary.'));
      });

      pdfParser.on('pdfParser_dataReady', () => {
        clearTimeout(timer);
        try {
          const raw = pdfParser.getRawTextContent();
          const decoded = decodeURIComponent(raw)
            .replace(/\r\n/g, '\n')
            .replace(/\r/g, '\n')
            .replace(/----------------Page \(\d+\) Break----------------/g, '\n')
            .trim();
          resolve(decoded);
        } catch {
          // Fallback if decodeURIComponent fails on special characters
          const raw = pdfParser.getRawTextContent().replace(/----------------Page \(\d+\) Break----------------/g, '\n').trim();
          resolve(raw);
        }
      });

      pdfParser.loadPDF(filePath);
    } catch (err) {
      reject(err);
    }
  });

/**
 * Clean and normalize a skill string
 */
const cleanSkill = (str) =>
  str
    .trim()
    .replace(/^[-•*–\d.)\s]+/, '')
    .trim();

/**
 * Extracts structured data from raw resume text
 * @param {string} rawText
 * @param {string} filename
 * @returns {object} Structured resume parsed data
 */
export const parseResumeText = (rawText = '', filename = '') => {
  if (!rawText || rawText.trim().length === 0) {
    return {
      summary: '',
      skills: [],
      education: [],
      projects: [],
      certifications: [],
      experience: [],
      achievements: [],
      keywords: []
    };
  }

  const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);
  const fullText = rawText;

  // 1. Skill Extraction: match known technical skills against full text
  const matchedSkillsSet = new Set();

  for (const skill of KNOWN_SKILLS) {
    const escaped = skill.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    if (regex.test(fullText)) {
      matchedSkillsSet.add(skill);
    }
  }

  // Also extract skills explicitly under a SKILLS / TECHNICAL SKILLS section
  const skillsSectionRegex = /(?:technical\s+skills|skills\s*&?\s*abilities|core\s+competencies|technologies|skills)\s*[:\n]([\s\S]*?)(?=\n\s*(?:projects|education|experience|certifications|achievements|work\s+experience|internships|$))/i;
  const skillsMatch = fullText.match(skillsSectionRegex);
  if (skillsMatch && skillsMatch[1]) {
    const rawSkills = skillsMatch[1]
      .split(/[,|\n•;]+/)
      .map(cleanSkill)
      .filter((s) => s.length >= 2 && s.length <= 40 && !/^(programming|languages|frameworks|tools|databases|technologies):?$/i.test(s));
    rawSkills.forEach((s) => matchedSkillsSet.add(s));
  }

  // 2. Summary / Objective Extraction
  let summary = '';
  const summaryMatch = fullText.match(/(?:summary|professional\s+summary|career\s+objective|about\s+me)\s*[:\n]([\s\S]*?)(?=\n\s*(?:skills|education|experience|projects|certifications|$))/i);
  if (summaryMatch && summaryMatch[1]) {
    summary = summaryMatch[1].replace(/\n+/g, ' ').trim().slice(0, 500);
  } else if (lines.length > 0) {
    // If first few lines contain a short descriptive statement (not contact info)
    const firstLines = lines.slice(0, 5).join(' ');
    if (firstLines.length > 40 && !firstLines.includes('@') && !/phone|email|usn/i.test(firstLines)) {
      summary = firstLines.slice(0, 300);
    }
  }

  // 3. Education Extraction
  const education = [];
  const educationSectionRegex = /(?:education|academic\s+background|qualifications)\s*[:\n]([\s\S]*?)(?=\n\s*(?:skills|experience|projects|certifications|achievements|$))/i;
  const eduMatch = fullText.match(educationSectionRegex);
  if (eduMatch && eduMatch[1]) {
    const eduLines = eduMatch[1]
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 5 && !/^(education|academic)/i.test(l));
    for (const el of eduLines) {
      if (education.length < 5) education.push(el.slice(0, 150));
    }
  } else {
    // Scan for degrees/colleges in text
    const degreeRegex = /(?:bachelor|master|b\.tech|b\.e\.|m\.tech|m\.s\.|bca|mca|diploma)[^\n.,]+/gi;
    const matches = fullText.match(degreeRegex);
    if (matches) {
      matches.slice(0, 3).forEach((d) => education.push(d.trim()));
    }
  }

  // 4. Projects Extraction
  const projects = [];
  const projectSectionRegex = /(?:projects|academic\s+projects|personal\s+projects|key\s+projects)\s*[:\n]([\s\S]*?)(?=\n\s*(?:skills|education|experience|certifications|achievements|work\s+experience|$))/i;
  const projMatch = fullText.match(projectSectionRegex);

  if (projMatch && projMatch[1]) {
    const projText = projMatch[1];
    // Split project entries by bullet points, double newlines, or numbered items
    const rawBlocks = projText.split(/(?:\n\s*[-•*]\s+|\n\s*(?=[A-Z0-9][\w\s-]{2,30}:|\d+\.\s+))/).filter((b) => b.trim().length > 15);

    for (const block of rawBlocks.slice(0, 6)) {
      const blockLines = block.split('\n').map((l) => l.trim()).filter(Boolean);
      if (!blockLines.length) continue;

      const firstLine = blockLines[0].replace(/^[-•*\d.)\s]+/, '').trim();
      const title = firstLine.split(/[-–|:(]/)[0].trim() || firstLine.slice(0, 60);
      const description = blockLines.slice(1).join(' ').trim() || blockLines[0];

      // Identify technologies used in this specific project
      const projTech = [];
      for (const skill of matchedSkillsSet) {
        if (new RegExp(`\\b${skill.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i').test(block)) {
          projTech.push(skill);
        }
      }

      projects.push({
        title: title.slice(0, 100),
        description: description.slice(0, 400),
        technologies: projTech.slice(0, 8)
      });
    }
  }

  // 5. Experience / Internships Extraction
  const experience = [];
  const expSectionRegex = /(?:work\s+experience|experience|internships|employment\s+history)\s*[:\n]([\s\S]*?)(?=\n\s*(?:skills|education|projects|certifications|achievements|$))/i;
  const expMatch = fullText.match(expSectionRegex);
  if (expMatch && expMatch[1]) {
    const expBlocks = expMatch[1].split(/(?:\n\s*[-•*]\s+|\n\s*(?=\d+\.\s+|[A-Z][\w\s]{2,30}\s*[-–]\s*))/).filter((b) => b.trim().length > 20);
    for (const block of expBlocks.slice(0, 5)) {
      const bLines = block.split('\n').map((l) => l.trim()).filter(Boolean);
      const companyOrRole = bLines[0]?.replace(/^[-•*\d.)\s]+/, '').trim() || '';
      experience.push({
        company: companyOrRole.split(/[-–|,]/)[0]?.trim() || 'Company',
        role: companyOrRole.split(/[-–|,]/)[1]?.trim() || 'Intern / Associate',
        duration: '',
        description: bLines.slice(1).join(' ').slice(0, 300)
      });
    }
  }

  // 6. Certifications Extraction
  const certifications = [];
  const certSectionRegex = /(?:certifications|certificates|licenses\s*&?\s*certifications|courses)\s*[:\n]([\s\S]*?)(?=\n\s*(?:skills|education|projects|experience|achievements|$))/i;
  const certMatch = fullText.match(certSectionRegex);
  if (certMatch && certMatch[1]) {
    const certLines = certMatch[1].split(/[\n•;]+/).map(cleanSkill).filter((c) => c.length > 5);
    certLines.slice(0, 6).forEach((c) => certifications.push(c.slice(0, 120)));
  }

  // 7. Achievements Extraction
  const achievements = [];
  const achSectionRegex = /(?:achievements|awards|honors|extracurricular)\s*[:\n]([\s\S]*?)(?=\n\s*(?:skills|education|projects|experience|certifications|$))/i;
  const achMatch = fullText.match(achSectionRegex);
  if (achMatch && achMatch[1]) {
    const achLines = achMatch[1].split(/[\n•;]+/).map(cleanSkill).filter((a) => a.length > 5);
    achLines.slice(0, 6).forEach((a) => achievements.push(a.slice(0, 150)));
  }

  // 8. Keywords: combine skills and high-frequency relevant terms
  const keywords = Array.from(matchedSkillsSet).slice(0, 20);

  return {
    summary,
    skills: Array.from(matchedSkillsSet),
    education,
    projects,
    certifications,
    experience,
    achievements,
    keywords
  };
};

/**
 * End-to-end parse of an uploaded PDF file
 * @param {string} filePath
 * @param {string} originalFilename
 */
export const parseResumeFile = async (filePath, originalFilename = '') => {
  try {
    const text = await extractTextFromPdf(filePath);
    if (!text || text.trim().length === 0) {
      console.warn(`[ResumeParser] PDF at ${filePath} yielded no text content.`);
      return {
        summary: '',
        skills: [],
        education: [],
        projects: [],
        certifications: [],
        experience: [],
        achievements: [],
        keywords: []
      };
    }
    return parseResumeText(text, originalFilename);
  } catch (error) {
    console.error(`[ResumeParser] Extraction error for ${filePath}:`, error.message);
    return {
      summary: '',
      skills: [],
      education: [],
      projects: [],
      certifications: [],
      experience: [],
      achievements: [],
      keywords: []
    };
  }
};

/**
 * Checks if a resume model has incomplete/legacy parsed data and re-parses from disk if possible
 * @param {object} resume - Mongoose Resume document
 * @returns {Promise<object>} - Updated resume document
 */
export const reparseResumeIfIncomplete = async (resume) => {
  if (!resume || !resume.fileUrl) return resume;

  const parsed = resume.parsed || {};
  const skills = parsed.skills || [];
  const projects = parsed.projects || [];

  // Check if parsed data is empty or appears to be from the old filename-based parser
  // (Old parser: split filename by - and _, keeping 3-8 words, often numbers or 'resume')
  const looksLikeOldParser =
    skills.length > 0 &&
    skills.every((s) => /^\d+$/.test(s) || /^(resume|pdf|doc|document|cv)$/i.test(s) || s.length < 3);

  const isIncomplete =
    looksLikeOldParser ||
    (skills.length === 0 && projects.length === 0 && (!parsed.education || parsed.education.length === 0));

  if (!isIncomplete) {
    return resume;
  }

  // Attempt to locate file on disk
  let candidatePath = resume.fileUrl;
  if (!fs.existsSync(candidatePath)) {
    // Try relative to workspace backend or root
    const altPath = path.join(process.cwd(), candidatePath);
    if (fs.existsSync(altPath)) candidatePath = altPath;
    else {
      const uploadsAlt = path.join(process.cwd(), 'uploads', path.basename(candidatePath));
      if (fs.existsSync(uploadsAlt)) candidatePath = uploadsAlt;
    }
  }

  if (fs.existsSync(candidatePath)) {
    try {
      console.log(`[ResumeParser] Re-parsing legacy resume ${resume._id} from: ${candidatePath}`);
      const refreshed = await parseResumeFile(candidatePath, resume.label || '');
      resume.parsed = refreshed;
      await resume.save();
      console.log(`[ResumeParser] Successfully refreshed resume ${resume._id}. Skills: ${refreshed.skills.length}, Projects: ${refreshed.projects.length}`);
    } catch (err) {
      console.error(`[ResumeParser] Could not re-parse legacy resume ${resume._id}:`, err.message);
    }
  }

  return resume;
};
