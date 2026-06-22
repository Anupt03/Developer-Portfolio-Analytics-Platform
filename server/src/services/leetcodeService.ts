import axios from 'axios';
import LeetCodeAnalytics, { ILeetCodeAnalytics } from '../models/LeetCodeAnalytics.js';
import Profile from '../models/Profile.js';
import { cache } from '../utils/cache.js';
import { BadRequestError } from '../utils/AppError.js';

const LEETCODE_API = 'https://alfa-leetcode-api.onrender.com';

class LeetCodeService {
  async fetchAndAnalyze(userId: string, username: string): Promise<ILeetCodeAnalytics> {
    const cacheKey = `leetcode:${username}`;
    const cached = cache.get<ILeetCodeAnalytics>(cacheKey);
    if (cached) return cached;

    try {
      // Fetch profile and solved data in parallel
      const [profileRes, solvedRes, contestRes] = await Promise.allSettled([
        axios.get(`${LEETCODE_API}/${username}`, { timeout: 15000 }),
        axios.get(`${LEETCODE_API}/${username}/solved`, { timeout: 15000 }),
        axios.get(`${LEETCODE_API}/${username}/contest`, { timeout: 15000 }),
      ]);

      const profileData = profileRes.status === 'fulfilled' ? profileRes.value.data : {};
      const solvedData = solvedRes.status === 'fulfilled' ? solvedRes.value.data : {};
      const contestData = contestRes.status === 'fulfilled' ? contestRes.value.data : {};

      if (!profileData || profileData.errors) {
        throw new BadRequestError(`LeetCode user '${username}' not found`);
      }

      const totalSolved = solvedData.solvedProblem || profileData.totalSolved || 0;
      const easySolved = solvedData.easySolved || profileData.easySolved || 0;
      const mediumSolved = solvedData.mediumSolved || profileData.mediumSolved || 0;
      const hardSolved = solvedData.hardSolved || profileData.hardSolved || 0;

      const contestRating = contestData.contestRating || 0;
      const contestAttended = contestData.contestAttend || 0;
      const contestGlobalRanking = contestData.contestGlobalRanking || 0;

      // Generate contest history from available data
      const contestHistory = (contestData.contestHistory || [])
        .slice(-20)
        .map((c: any) => ({
          contestName: c.contest?.title || 'Contest',
          ranking: c.ranking || 0,
          rating: Math.round(c.rating || 0),
          date: c.contest?.startTime
            ? new Date(c.contest.startTime * 1000).toISOString().split('T')[0]
            : '',
        }));

      // Calculate DSA readiness score
      const dsaReadinessScore = this.calculateDSAScore(
        totalSolved, easySolved, mediumSolved, hardSolved, contestRating
      );

      const analyticsData = {
        userId,
        username,
        totalSolved,
        easySolved,
        mediumSolved,
        hardSolved,
        totalQuestions: solvedData.totalQuestions || 3200,
        easyTotal: solvedData.easyTotal || 800,
        mediumTotal: solvedData.mediumTotal || 1700,
        hardTotal: solvedData.hardTotal || 700,
        acceptanceRate: parseFloat(profileData.acceptanceRate) || 0,
        ranking: profileData.ranking || 0,
        contributionPoints: profileData.contributionPoints || 0,
        reputation: profileData.reputation || 0,
        contestRating: Math.round(contestRating),
        contestGlobalRanking,
        contestAttended,
        contestHistory,
        streak: profileData.streak || 0,
        badges: (profileData.badges || []).map((b: any) => ({
          name: b.displayName || b.name || '',
          icon: b.icon || '',
        })),
        recentSubmissions: (profileData.recentSubmissions || [])
          .slice(0, 10)
          .map((s: any) => ({
            title: s.title || '',
            difficulty: s.difficulty || '',
            status: s.statusDisplay || '',
            timestamp: s.timestamp || '',
          })),
        dsaReadinessScore,
        lastFetched: new Date(),
      };

      // Upsert
      const analytics = await LeetCodeAnalytics.findOneAndUpdate(
        { userId },
        analyticsData,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      // Update profile
      await Profile.findOneAndUpdate(
        { userId },
        { leetcodeUsername: username, dsaScore: dsaReadinessScore }
      );

      cache.set(cacheKey, analytics, 10 * 60 * 1000);
      return analytics;
    } catch (error: any) {
      if (error instanceof BadRequestError) throw error;
      if (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK') {
        throw new BadRequestError(
          'LeetCode API is currently unavailable. Please try again later.'
        );
      }
      throw error;
    }
  }

  async getAnalytics(userId: string): Promise<ILeetCodeAnalytics | null> {
    return LeetCodeAnalytics.findOne({ userId });
  }

  private calculateDSAScore(
    total: number, easy: number, medium: number, hard: number, contestRating: number
  ): number {
    let score = 0;

    // Total problems (max 30 pts) — benchmark: 300 problems
    score += Math.min((total / 300) * 30, 30);

    // Hard problems ratio (max 25 pts) — benchmark: 50 hards
    score += Math.min((hard / 50) * 25, 25);

    // Medium problems ratio (max 25 pts) — benchmark: 150 mediums
    score += Math.min((medium / 150) * 25, 25);

    // Contest rating (max 20 pts) — benchmark: 1800 rating
    score += Math.min((contestRating / 1800) * 20, 20);

    return Math.min(Math.round(score), 100);
  }
}

export default new LeetCodeService();
