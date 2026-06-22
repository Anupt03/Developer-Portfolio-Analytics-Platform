import mongoose, { Document, Schema } from 'mongoose';

export interface IResumeData extends Document {
  userId: mongoose.Types.ObjectId;
  fileName: string;
  rawText: string;
  skills: string[];
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    year: string;
  }>;
  experience: Array<{
    company: string;
    role: string;
    duration: string;
    description: string;
  }>;
  contactInfo: {
    email?: string;
    phone?: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
  atsScore: number;
  resumeQualityScore: number;
  missingSkills: string[];
  improvementTips: string[];
  analyzedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const resumeDataSchema = new Schema<IResumeData>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    fileName: { type: String, required: true },
    rawText: { type: String, default: '' },
    skills: [{ type: String, trim: true }],
    projects: [
      {
        name: String,
        description: String,
        technologies: [String],
      },
    ],
    education: [
      {
        institution: String,
        degree: String,
        field: String,
        year: String,
      },
    ],
    experience: [
      {
        company: String,
        role: String,
        duration: String,
        description: String,
      },
    ],
    contactInfo: {
      email: String,
      phone: String,
      linkedin: String,
      github: String,
      portfolio: String,
    },
    atsScore: { type: Number, default: 0, min: 0, max: 100 },
    resumeQualityScore: { type: Number, default: 0, min: 0, max: 100 },
    missingSkills: [String],
    improvementTips: [String],
    analyzedAt: Date,
  },
  {
    timestamps: true,
  }
);

resumeDataSchema.index({ userId: 1 });

export default mongoose.model<IResumeData>('ResumeData', resumeDataSchema);
