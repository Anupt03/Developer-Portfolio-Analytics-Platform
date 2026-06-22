import Profile from '../models/Profile.js';
import User from '../models/User.js';
import GitHubAnalytics from '../models/GitHubAnalytics.js';
import LeetCodeAnalytics from '../models/LeetCodeAnalytics.js';
import RecruiterSearch from '../models/RecruiterSearch.js';

interface SearchFilters {
  skills?: string[];
  minScore?: number;
  maxScore?: number;
  location?: string;
  query?: string;
}

interface DeveloperCard {
  userId: string;
  name: string;
  email: string;
  avatar: string;
  bio: string;
  location: string;
  skills: string[];
  hiringReadinessScore: number;
  githubScore: number;
  dsaScore: number;
  resumeScore: number;
  githubUsername: string;
  leetcodeUsername: string;
}

class RecruiterService {
  async searchDevelopers(
    recruiterId: string,
    filters: SearchFilters,
    page: number = 1,
    limit: number = 12
  ): Promise<{ developers: DeveloperCard[]; total: number; page: number; totalPages: number }> {
    const query: any = { isPublic: true };

    if (filters.skills && filters.skills.length > 0) {
      query.skills = { $in: filters.skills };
    }
    if (filters.minScore !== undefined) {
      query.hiringReadinessScore = { ...query.hiringReadinessScore, $gte: filters.minScore };
    }
    if (filters.maxScore !== undefined) {
      query.hiringReadinessScore = { ...query.hiringReadinessScore, $lte: filters.maxScore };
    }
    if (filters.location) {
      query.location = { $regex: filters.location, $options: 'i' };
    }

    const skip = (page - 1) * limit;
    const total = await Profile.countDocuments(query);

    const profiles = await Profile.find(query)
      .sort({ hiringReadinessScore: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Fetch user data for each profile
    const userIds = profiles.map((p) => p.userId);
    const users = await User.find({ _id: { $in: userIds } }).select('name email avatar').lean();
    const userMap = new Map(users.map((u) => [u._id.toString(), u]));

    const developers: DeveloperCard[] = profiles.map((profile) => {
      const user = userMap.get(profile.userId.toString());
      return {
        userId: profile.userId.toString(),
        name: user?.name || 'Unknown',
        email: user?.email || '',
        avatar: user?.avatar || '',
        bio: profile.bio,
        location: profile.location,
        skills: profile.skills.slice(0, 8),
        hiringReadinessScore: profile.hiringReadinessScore,
        githubScore: profile.githubScore,
        dsaScore: profile.dsaScore,
        resumeScore: profile.resumeScore,
        githubUsername: profile.githubUsername,
        leetcodeUsername: profile.leetcodeUsername,
      };
    });

    // Log search
    await RecruiterSearch.create({
      recruiterId,
      searchQuery: filters.query || '',
      filters,
      resultCount: total,
    });

    return {
      developers,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getDeveloperProfile(developerId: string): Promise<any> {
    const [profile, user, github, leetcode] = await Promise.all([
      Profile.findOne({ userId: developerId, isPublic: true }).lean(),
      User.findById(developerId).select('name email avatar createdAt').lean(),
      GitHubAnalytics.findOne({ userId: developerId }).lean(),
      LeetCodeAnalytics.findOne({ userId: developerId }).lean(),
    ]);

    if (!profile || !user) return null;

    return {
      user: { name: user.name, avatar: user.avatar, joinedAt: user.createdAt },
      profile,
      github: github ? {
        username: github.username,
        avatarUrl: github.avatarUrl,
        totalStars: github.totalStars,
        totalForks: github.totalForks,
        publicRepos: github.publicRepos,
        followers: github.followers,
        topLanguages: github.topLanguages,
        qualityScore: github.qualityScore,
        consistencyScore: github.consistencyScore,
      } : null,
      leetcode: leetcode ? {
        username: leetcode.username,
        totalSolved: leetcode.totalSolved,
        easySolved: leetcode.easySolved,
        mediumSolved: leetcode.mediumSolved,
        hardSolved: leetcode.hardSolved,
        contestRating: leetcode.contestRating,
        dsaReadinessScore: leetcode.dsaReadinessScore,
      } : null,
    };
  }

  async compareDevelopers(developerIds: string[]): Promise<any[]> {
    const comparisons = await Promise.all(
      developerIds.slice(0, 5).map((id) => this.getDeveloperProfile(id))
    );
    return comparisons.filter(Boolean);
  }

  async getSavedCandidates(recruiterId: string): Promise<any[]> {
    const searches = await RecruiterSearch.find({ recruiterId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
    return searches;
  }
}

export default new RecruiterService();
