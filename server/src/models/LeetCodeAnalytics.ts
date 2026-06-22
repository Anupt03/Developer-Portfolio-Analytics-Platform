import mongoose, { Document, Schema } from 'mongoose';

export interface ILeetCodeAnalytics extends Document {
  userId: mongoose.Types.ObjectId;
  username: string;
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  totalQuestions: number;
  easyTotal: number;
  mediumTotal: number;
  hardTotal: number;
  acceptanceRate: number;
  ranking: number;
  contributionPoints: number;
  reputation: number;
  contestRating: number;
  contestGlobalRanking: number;
  contestAttended: number;
  contestHistory: Array<{
    contestName: string;
    ranking: number;
    rating: number;
    date: string;
  }>;
  streak: number;
  badges: Array<{ name: string; icon: string }>;
  recentSubmissions: Array<{
    title: string;
    difficulty: string;
    status: string;
    timestamp: string;
  }>;
  dsaReadinessScore: number;
  lastFetched: Date;
  createdAt: Date;
  updatedAt: Date;
}

const leetcodeAnalyticsSchema = new Schema<ILeetCodeAnalytics>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    username: { type: String, required: true },
    totalSolved: { type: Number, default: 0 },
    easySolved: { type: Number, default: 0 },
    mediumSolved: { type: Number, default: 0 },
    hardSolved: { type: Number, default: 0 },
    totalQuestions: { type: Number, default: 0 },
    easyTotal: { type: Number, default: 0 },
    mediumTotal: { type: Number, default: 0 },
    hardTotal: { type: Number, default: 0 },
    acceptanceRate: { type: Number, default: 0 },
    ranking: { type: Number, default: 0 },
    contributionPoints: { type: Number, default: 0 },
    reputation: { type: Number, default: 0 },
    contestRating: { type: Number, default: 0 },
    contestGlobalRanking: { type: Number, default: 0 },
    contestAttended: { type: Number, default: 0 },
    contestHistory: [
      {
        contestName: String,
        ranking: Number,
        rating: Number,
        date: String,
      },
    ],
    streak: { type: Number, default: 0 },
    badges: [
      {
        name: String,
        icon: String,
      },
    ],
    recentSubmissions: [
      {
        title: String,
        difficulty: String,
        status: String,
        timestamp: String,
      },
    ],
    dsaReadinessScore: { type: Number, default: 0, min: 0, max: 100 },
    lastFetched: Date,
  },
  {
    timestamps: true,
  }
);

leetcodeAnalyticsSchema.index({ userId: 1 });
leetcodeAnalyticsSchema.index({ username: 1 });

export default mongoose.model<ILeetCodeAnalytics>('LeetCodeAnalytics', leetcodeAnalyticsSchema);
