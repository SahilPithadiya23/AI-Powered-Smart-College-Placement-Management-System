import mongoose from 'mongoose';

const projectItemSchema = new mongoose.Schema(
  {
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    technologies: [{ type: String }]
  },
  { _id: false }
);

const experienceItemSchema = new mongoose.Schema(
  {
    company: { type: String, default: '' },
    role: { type: String, default: '' },
    duration: { type: String, default: '' },
    description: { type: String, default: '' }
  },
  { _id: false }
);

const resumeSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    label: { type: String, default: 'Resume' },
    fileUrl: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
    parsed: {
      summary: { type: String, default: '' },
      skills: [{ type: String }],
      education: [{ type: String }],
      projects: {
        type: [projectItemSchema],
        default: [],
        set: (items) => {
          if (!Array.isArray(items)) return [];
          return items.map((item) => {
            if (typeof item === 'string') {
              return { title: item, description: '', technologies: [] };
            }
            return item;
          });
        }
      },
      certifications: [{ type: String }],
      experience: {
        type: [experienceItemSchema],
        default: []
      },
      achievements: [{ type: String }],
      keywords: [{ type: String }]
    }
  },
  { timestamps: true }
);

export const Resume = mongoose.model('Resume', resumeSchema);

