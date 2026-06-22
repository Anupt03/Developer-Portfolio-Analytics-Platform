import GitHubAnalytics from '../models/GitHubAnalytics.js';
import LeetCodeAnalytics from '../models/LeetCodeAnalytics.js';
import ResumeData from '../models/ResumeData.js';
import Profile from '../models/Profile.js';

interface CareerInsight {
  id: string;
  category: 'github' | 'dsa' | 'resume' | 'general';
  severity: 'success' | 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  actionItem: string;
}

interface HiringReadiness {
  overallScore: number;
  breakdown: {
    github: { score: number; weight: 30; weighted: number };
    dsa: { score: number; weight: 25; weighted: number };
    resume: { score: number; weight: 20; weighted: number };
    consistency: { score: number; weight: 15; weighted: number };
    openSource: { score: number; weight: 10; weighted: number };
  };
  placementProbability: string;
  level: string;
  skillGaps: Array<{ skill: string; current: string; required: string; priority: string }>;
}

class AIService {
  async generateInsights(userId: string): Promise<CareerInsight[]> {
    const [github, leetcode, resume, profile] = await Promise.all([
      GitHubAnalytics.findOne({ userId }),
      LeetCodeAnalytics.findOne({ userId }),
      ResumeData.findOne({ userId }),
      Profile.findOne({ userId }),
    ]);

    const insights: CareerInsight[] = [];
    let id = 1;

    // GitHub Insights
    if (github) {
      if (github.qualityScore < 40) {
        insights.push({
          id: `insight-${id++}`,
          category: 'github',
          severity: 'warning',
          title: 'GitHub Activity Below Average',
          message: `Your GitHub quality score is ${github.qualityScore}/100. The industry average for entry-level developers is around 45-55.`,
          actionItem: 'Create 3-4 well-documented projects with READMEs, proper commit history, and meaningful descriptions.',
        });
      } else if (github.qualityScore >= 70) {
        insights.push({
          id: `insight-${id++}`,
          category: 'github',
          severity: 'success',
          title: 'Strong GitHub Presence',
          message: `Your GitHub quality score is ${github.qualityScore}/100. You're above the industry average!`,
          actionItem: 'Consider contributing to popular open-source projects to further strengthen your profile.',
        });
      }

      if (github.totalStars < 5) {
        insights.push({
          id: `insight-${id++}`,
          category: 'github',
          severity: 'info',
          title: 'Low Repository Stars',
          message: 'Your repositories have few stars. Stars indicate project quality and community interest.',
          actionItem: 'Share your best projects on social media and developer communities like Reddit, Hacker News, and Dev.to.',
        });
      }

      if (github.topLanguages.length < 3) {
        insights.push({
          id: `insight-${id++}`,
          category: 'github',
          severity: 'info',
          title: 'Limited Language Diversity',
          message: 'Knowing multiple programming languages demonstrates versatility to recruiters.',
          actionItem: 'Build projects in at least 2-3 different languages relevant to your target roles.',
        });
      }

      if (github.consistencyScore < 40) {
        insights.push({
          id: `insight-${id++}`,
          category: 'github',
          severity: 'warning',
          title: 'Inconsistent Coding Activity',
          message: `Your consistency score is ${github.consistencyScore}/100. Regular coding activity signals dedication.`,
          actionItem: 'Try to make at least 1 commit per day, even small ones. Set up a daily coding habit.',
        });
      }

      // Cloud/DevOps insight
      const hasCloudProject = github.repos.some((r) =>
        ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'cloud', 'deploy', 'terraform']
          .some((kw) => (r.description + r.name + (r.topics || []).join(' ')).toLowerCase().includes(kw))
      );
      if (!hasCloudProject) {
        insights.push({
          id: `insight-${id++}`,
          category: 'github',
          severity: 'warning',
          title: 'No Cloud/DevOps Projects',
          message: 'Cloud computing skills are highly sought by employers. No cloud-related projects were found.',
          actionItem: 'Add cloud projects to improve employability — deploy an app on AWS/GCP or containerize with Docker.',
        });
      }
    } else {
      insights.push({
        id: `insight-${id++}`,
        category: 'github',
        severity: 'critical',
        title: 'GitHub Not Connected',
        message: 'Connect your GitHub account to get a comprehensive analysis of your coding activity.',
        actionItem: 'Go to GitHub Analytics and connect your GitHub username.',
      });
    }

    // LeetCode / DSA Insights
    if (leetcode) {
      if (leetcode.totalSolved < 100) {
        insights.push({
          id: `insight-${id++}`,
          category: 'dsa',
          severity: 'warning',
          title: 'Solve More DSA Problems',
          message: `You've solved ${leetcode.totalSolved} problems. Most top tech companies expect 150-300+ problems.`,
          actionItem: `Solve ${Math.max(100 - leetcode.totalSolved, 50)} more medium-level questions to improve your placement chances.`,
        });
      } else if (leetcode.totalSolved >= 200) {
        insights.push({
          id: `insight-${id++}`,
          category: 'dsa',
          severity: 'success',
          title: 'Excellent Problem-Solving Record',
          message: `${leetcode.totalSolved} problems solved! You're well-prepared for technical interviews.`,
          actionItem: 'Focus on hard problems and mock interviews to maintain sharpness.',
        });
      }

      if (leetcode.hardSolved < 20) {
        insights.push({
          id: `insight-${id++}`,
          category: 'dsa',
          severity: 'info',
          title: 'More Hard Problems Needed',
          message: `Only ${leetcode.hardSolved} hard problems solved. FAANG interviews often include hard-level questions.`,
          actionItem: 'Aim to solve at least 30-50 hard problems across different topics.',
        });
      }

      if (leetcode.contestRating > 0 && leetcode.contestRating < 1500) {
        insights.push({
          id: `insight-${id++}`,
          category: 'dsa',
          severity: 'info',
          title: 'Contest Rating Can Improve',
          message: `Your contest rating is ${leetcode.contestRating}. A rating above 1600 is considered competitive.`,
          actionItem: 'Participate in weekly contests regularly to improve your competitive programming skills.',
        });
      }
    } else {
      insights.push({
        id: `insight-${id++}`,
        category: 'dsa',
        severity: 'critical',
        title: 'LeetCode Not Connected',
        message: 'Connect your LeetCode account to analyze your DSA preparation level.',
        actionItem: 'Go to LeetCode Analytics and enter your LeetCode username.',
      });
    }

    // Resume Insights
    if (resume) {
      if (resume.atsScore < 60) {
        insights.push({
          id: `insight-${id++}`,
          category: 'resume',
          severity: 'warning',
          title: 'Resume Needs ATS Optimization',
          message: `Your ATS score is ${resume.atsScore}/100. Many companies use ATS filters that may reject your resume.`,
          actionItem: 'Add more industry keywords, quantify achievements, and use a clean, ATS-friendly format.',
        });
      }

      if (resume.missingSkills.length > 5) {
        insights.push({
          id: `insight-${id++}`,
          category: 'resume',
          severity: 'info',
          title: 'Missing In-Demand Skills',
          message: `${resume.missingSkills.length} in-demand skills are missing from your resume: ${resume.missingSkills.slice(0, 5).join(', ')}`,
          actionItem: 'Learn and add these skills to your resume as you gain proficiency.',
        });
      }

      if (resume.projects.length < 3) {
        insights.push({
          id: `insight-${id++}`,
          category: 'resume',
          severity: 'warning',
          title: 'Add More Projects',
          message: 'Recruiters prefer resumes with 3-5 well-described projects.',
          actionItem: 'Add full-stack projects, open-source contributions, or hackathon projects to your resume.',
        });
      }
    } else {
      insights.push({
        id: `insight-${id++}`,
        category: 'resume',
        severity: 'critical',
        title: 'Resume Not Uploaded',
        message: 'Upload your resume to get ATS score analysis and improvement suggestions.',
        actionItem: 'Go to Resume Analyzer and upload your resume PDF.',
      });
    }

    // General insights
    const connectedCount = [github, leetcode, resume].filter(Boolean).length;
    if (connectedCount === 3) {
      insights.push({
        id: `insight-${id++}`,
        category: 'general',
        severity: 'success',
        title: 'Complete Profile',
        message: 'Great job! All three data sources are connected for comprehensive analysis.',
        actionItem: 'Keep your profiles updated regularly for accurate insights.',
      });
    }

    return insights;
  }

  async getHiringReadiness(userId: string): Promise<HiringReadiness> {
    const profile = await Profile.findOne({ userId });

    const githubScore = profile?.githubScore || 0;
    const dsaScore = profile?.dsaScore || 0;
    const resumeScore = profile?.resumeScore || 0;
    const consistencyScore = profile?.consistencyScore || 0;
    const openSourceScore = profile?.openSourceScore || 0;

    const breakdown = {
      github: { score: githubScore, weight: 30 as const, weighted: Math.round(githubScore * 0.3) },
      dsa: { score: dsaScore, weight: 25 as const, weighted: Math.round(dsaScore * 0.25) },
      resume: { score: resumeScore, weight: 20 as const, weighted: Math.round(resumeScore * 0.2) },
      consistency: { score: consistencyScore, weight: 15 as const, weighted: Math.round(consistencyScore * 0.15) },
      openSource: { score: openSourceScore, weight: 10 as const, weighted: Math.round(openSourceScore * 0.1) },
    };

    const overallScore = breakdown.github.weighted + breakdown.dsa.weighted +
      breakdown.resume.weighted + breakdown.consistency.weighted + breakdown.openSource.weighted;

    // Calculate placement probability
    let placementProbability: string;
    let level: string;
    if (overallScore >= 80) {
      placementProbability = '85-95%';
      level = 'Excellent';
    } else if (overallScore >= 65) {
      placementProbability = '70-85%';
      level = 'Good';
    } else if (overallScore >= 50) {
      placementProbability = '50-70%';
      level = 'Moderate';
    } else if (overallScore >= 35) {
      placementProbability = '30-50%';
      level = 'Developing';
    } else {
      placementProbability = '10-30%';
      level = 'Needs Improvement';
    }

    // Skill gap analysis
    const skillGaps = this.analyzeSkillGaps(githubScore, dsaScore, resumeScore, consistencyScore, openSourceScore);

    // Update profile with overall score
    await Profile.findOneAndUpdate({ userId }, { hiringReadinessScore: overallScore });

    return { overallScore, breakdown, placementProbability, level, skillGaps };
  }

  private analyzeSkillGaps(
    github: number, dsa: number, resume: number, consistency: number, openSource: number
  ): Array<{ skill: string; current: string; required: string; priority: string }> {
    const gaps: Array<{ skill: string; current: string; required: string; priority: string }> = [];

    if (github < 50) {
      gaps.push({
        skill: 'GitHub Portfolio',
        current: this.getLevel(github),
        required: 'Intermediate',
        priority: 'High',
      });
    }
    if (dsa < 50) {
      gaps.push({
        skill: 'Data Structures & Algorithms',
        current: this.getLevel(dsa),
        required: 'Intermediate',
        priority: 'High',
      });
    }
    if (resume < 50) {
      gaps.push({
        skill: 'Resume Quality',
        current: this.getLevel(resume),
        required: 'Intermediate',
        priority: 'Medium',
      });
    }
    if (consistency < 40) {
      gaps.push({
        skill: 'Coding Consistency',
        current: this.getLevel(consistency),
        required: 'Regular',
        priority: 'Medium',
      });
    }
    if (openSource < 30) {
      gaps.push({
        skill: 'Open Source Contributions',
        current: this.getLevel(openSource),
        required: 'Active Contributor',
        priority: 'Low',
      });
    }

    return gaps;
  }

  private getLevel(score: number): string {
    if (score >= 80) return 'Expert';
    if (score >= 60) return 'Advanced';
    if (score >= 40) return 'Intermediate';
    if (score >= 20) return 'Beginner';
    return 'Not Started';
  }
}

export default new AIService();
