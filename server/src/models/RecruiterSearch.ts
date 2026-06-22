import mongoose, { Document, Schema } from 'mongoose';

export interface IRecruiterSearch extends Document {
  recruiterId: mongoose.Types.ObjectId;
  searchQuery: string;
  filters: {
    skills?: string[];
    minScore?: number;
    maxScore?: number;
    location?: string;
    experienceLevel?: string;
  };
  resultCount: number;
  savedCandidates: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const recruiterSearchSchema = new Schema<IRecruiterSearch>(
  {
    recruiterId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    searchQuery: { type: String, default: '' },
    filters: {
      skills: [String],
      minScore: Number,
      maxScore: Number,
      location: String,
      experienceLevel: String,
    },
    resultCount: { type: Number, default: 0 },
    savedCandidates: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  {
    timestamps: true,
  }
);

recruiterSearchSchema.index({ recruiterId: 1 });
recruiterSearchSchema.index({ createdAt: -1 });

export default mongoose.model<IRecruiterSearch>('RecruiterSearch', recruiterSearchSchema);
