import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    phone: String,
    usn: { type: String, unique: true, sparse: true },
    branch: String,
    cgpa: { type: Number, min: 0, max: 10 },
    backlogs: { type: Number, default: 0 },
    graduationYear: Number,
    skills: [String],
    certifications: [String],
    projects: [{ title: String, description: String, techStack: [String], link: String }],
    internships: [{ company: String, role: String, duration: String }],
    linkedin: String,
    github: String,
    portfolio: String,
    profilePhoto: String,
    placementProbability: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export const Student = mongoose.model('Student', studentSchema);
