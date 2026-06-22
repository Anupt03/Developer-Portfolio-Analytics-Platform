import mongoose, { Document, Schema } from 'mongoose';

export interface IProfile extends Document {
  userId: mongoose.Types.ObjectId;
  bio: string;
  location: string;
  website: string;
  socialLinks: {
    linkedin?: string;
    twitter?: string;
    portfolio?: string;
  };
  skills: string[];
  githubUsername: string;
  leetcodeUsername: string;
  hiringReadinessScore: number;
  githubScore: number;
  dsaScore: number;
  resumeScore: number;
  consistencyScore: number;
  openSourceScore: number;
  isPublic: boolean;
  lastAnalyzedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const profileSchema = new Schema<IProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
      default: '',
    },
    location: {
      type: String,
      default: '',
    },
    website: {
      type: String,
      default: '',
    },
    socialLinks: {
      linkedin: String,
      twitter: String,
      portfolio: String,
    },
    skills: [{ type: String, trim: true }],
    githubUsername: {
      type: String,
      trim: true,
      default: '',
    },
    leetcodeUsername: {
      type: String,
      trim: true,
      default: '',
    },
    hiringReadinessScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    githubScore: { type: Number, default: 0, min: 0, max: 100 },
    dsaScore: { type: Number, default: 0, min: 0, max: 100 },
    resumeScore: { type: Number, default: 0, min: 0, max: 100 },
    consistencyScore: { type: Number, default: 0, min: 0, max: 100 },
    openSourceScore: { type: Number, default: 0, min: 0, max: 100 },
    isPublic: {
      type: Boolean,
      default: true,
    },
    lastAnalyzedAt: Date,
  },
  {
    timestamps: true,
  }
);

profileSchema.index({ userId: 1 });
profileSchema.index({ skills: 1 });
profileSchema.index({ hiringReadinessScore: -1 });
profileSchema.index({ isPublic: 1 });

export default mongoose.model<IProfile>('Profile', profileSchema);
