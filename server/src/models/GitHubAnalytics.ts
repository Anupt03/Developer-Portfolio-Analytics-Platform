import mongoose, { Document, Schema } from 'mongoose';

export interface IRepoData {
  name: string;
  fullName: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  watchers: number;
  openIssues: number;
  size: number;
  createdAt: Date;
  updatedAt: Date;
  htmlUrl: string;
  hasReadme: boolean;
  topics: string[];
}

export interface IGitHubAnalytics extends Document {
  userId: mongoose.Types.ObjectId;
  username: string;
  avatarUrl: string;
  profileUrl: string;
  bio: string;
  publicRepos: number;
  followers: number;
  following: number;
  repos: IRepoData[];
  totalStars: number;
  totalForks: number;
  languages: Record<string, number>;
  topLanguages: Array<{ name: string; percentage: number; color: string }>;
  commitActivity: Array<{
    week: string;
    commits: number;
  }>;
  totalContributions: number;
  contributionsByDay: Array<{ date: string; count: number }>;
  qualityScore: number;
  openSourceScore: number;
  consistencyScore: number;
  lastFetched: Date;
  createdAt: Date;
  updatedAt: Date;
}

const repoDataSchema = new Schema<IRepoData>(
  {
    name: String,
    fullName: String,
    description: { type: String, default: '' },
    language: { type: String, default: 'Unknown' },
    stars: { type: Number, default: 0 },
    forks: { type: Number, default: 0 },
    watchers: { type: Number, default: 0 },
    openIssues: { type: Number, default: 0 },
    size: { type: Number, default: 0 },
    createdAt: Date,
    updatedAt: Date,
    htmlUrl: String,
    hasReadme: { type: Boolean, default: false },
    topics: [String],
  },
  { _id: false }
);

const githubAnalyticsSchema = new Schema<IGitHubAnalytics>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    username: { type: String, required: true },
    avatarUrl: String,
    profileUrl: String,
    bio: { type: String, default: '' },
    publicRepos: { type: Number, default: 0 },
    followers: { type: Number, default: 0 },
    following: { type: Number, default: 0 },
    repos: [repoDataSchema],
    totalStars: { type: Number, default: 0 },
    totalForks: { type: Number, default: 0 },
    languages: { type: Schema.Types.Mixed, default: {} },
    topLanguages: [
      {
        name: String,
        percentage: Number,
        color: String,
      },
    ],
    commitActivity: [
      {
        week: String,
        commits: Number,
      },
    ],
    totalContributions: { type: Number, default: 0 },
    contributionsByDay: [
      {
        date: String,
        count: Number,
      },
    ],
    qualityScore: { type: Number, default: 0, min: 0, max: 100 },
    openSourceScore: { type: Number, default: 0, min: 0, max: 100 },
    consistencyScore: { type: Number, default: 0, min: 0, max: 100 },
    lastFetched: Date,
  },
  {
    timestamps: true,
  }
);

githubAnalyticsSchema.index({ userId: 1 });
githubAnalyticsSchema.index({ username: 1 });

export default mongoose.model<IGitHubAnalytics>('GitHubAnalytics', githubAnalyticsSchema);
