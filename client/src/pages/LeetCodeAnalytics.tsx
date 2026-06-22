import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Code2, Target, Trophy, Award, History, Activity } from 'lucide-react';
import { toast } from 'react-hot-toast';

import type { RootState } from '../store';
import { fetchLeetCodeAnalytics, connectLeetCode } from '../store/leetcodeSlice';
import StatsCard from '../components/StatsCard';
import ScoreGauge from '../components/ScoreGauge';
import LoadingSpinner from '../components/LoadingSpinner';

const LeetCodeAnalytics = () => {
  const dispatch = useDispatch();
  const { data, isLoading, error } = useSelector((state: RootState) => state.leetcode);
  const [username, setUsername] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    dispatch(fetchLeetCodeAnalytics() as any);
  }, [dispatch]);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setIsConnecting(true);
    try {
      await dispatch(connectLeetCode(username) as any).unwrap();
      toast.success('LeetCode profile connected successfully!');
    } catch (err: any) {
      toast.error(err || 'Failed to connect LeetCode');
    } finally {
      setIsConnecting(false);
    }
  };

  if (isLoading && !data && !isConnecting) {
    return <LoadingSpinner fullScreen />;
  }

  // Not connected state
  if (!data && !isLoading && !isConnecting) {
    return (
      <div className="h-[calc(100vh-12rem)] flex items-center justify-center">
        <div className="glass-card p-10 rounded-3xl max-w-lg w-full text-center border border-white/10">
          <div className="w-20 h-20 bg-[#ffa116]/20 border border-[#ffa116]/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(255,161,22,0.2)]">
            <Code2 className="w-10 h-10 text-[#ffa116]" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Connect LeetCode</h2>
          <p className="text-gray-400 mb-8">
            Connect your LeetCode account to analyze your problem-solving skills and DSA readiness score.
          </p>
          
          <form onSubmit={handleConnect} className="space-y-4">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="LeetCode Username"
              className="w-full px-4 py-3 bg-surface border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
            <button
              type="submit"
              disabled={!username.trim()}
              className="w-full py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-medium transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Analyze Profile
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (isConnecting) {
    return (
      <div className="h-[calc(100vh-12rem)] flex flex-col items-center justify-center space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-lg font-medium text-gray-300 animate-pulse">Analyzing LeetCode submissions...</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl">
        <h3 className="text-red-400 font-semibold mb-2">Error loading LeetCode data</h3>
        <p className="text-red-300/80 text-sm">{error}</p>
        <button 
          onClick={() => dispatch(fetchLeetCodeAnalytics() as any)}
          className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-sm transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'medium': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'hard': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getStatusColor = (status: string) => {
    return status.toLowerCase() === 'accepted' ? 'text-emerald-400' : 'text-red-400';
  };

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-[#ffa116]/10 border border-[#ffa116]/20 rounded-2xl flex items-center justify-center shadow-lg">
            <Code2 className="w-10 h-10 text-[#ffa116]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{data.username}</h1>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-1.5 text-gray-400">
                <Trophy className="w-4 h-4 text-[#ffa116]" />
                Rank: <span className="text-white font-medium">{data.ranking.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-400">
                <Activity className="w-4 h-4 text-emerald-400" />
                Streak: <span className="text-white font-medium">{data.streak} days</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-400">
                <Target className="w-4 h-4 text-blue-400" />
                Acceptance: <span className="text-white font-medium">{data.acceptanceRate}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pl-6 md:border-l border-white/10 flex items-center justify-center">
          <ScoreGauge 
            score={data.dsaReadinessScore} 
            size={120} 
            label="DSA Readiness" 
            colorClass="text-[#ffa116]" 
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Total Solved" value={`${data.totalSolved} / ${data.totalQuestions}`} icon={Code2} />
        <StatsCard title="Contest Rating" value={data.contestRating} icon={Trophy} />
        <StatsCard title="Global Ranking" value={data.contestGlobalRanking.toLocaleString() || 'Unranked'} icon={Award} />
        <StatsCard title="Contests Attended" value={data.contestAttended} icon={History} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Solved Problems Breakdown */}
        <div className="glass-card p-6 rounded-2xl border border-white/5">
          <h3 className="text-lg font-semibold text-white mb-6">Problems Solved</h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-emerald-400 font-medium">Easy</span>
                <span className="text-gray-300">{data.easySolved} <span className="text-gray-500">/ {data.easyTotal}</span></span>
              </div>
              <div className="h-2.5 w-full bg-surface rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]" 
                  style={{ width: `${Math.min((data.easySolved / data.easyTotal) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-amber-400 font-medium">Medium</span>
                <span className="text-gray-300">{data.mediumSolved} <span className="text-gray-500">/ {data.mediumTotal}</span></span>
              </div>
              <div className="h-2.5 w-full bg-surface rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]" 
                  style={{ width: `${Math.min((data.mediumSolved / data.mediumTotal) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-red-400 font-medium">Hard</span>
                <span className="text-gray-300">{data.hardSolved} <span className="text-gray-500">/ {data.hardTotal}</span></span>
              </div>
              <div className="h-2.5 w-full bg-surface rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.5)]" 
                  style={{ width: `${Math.min((data.hardSolved / data.hardTotal) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Submissions */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-white/5">
          <h3 className="text-lg font-semibold text-white mb-6">Recent Submissions</h3>
          <div className="space-y-4">
            {data.recentSubmissions && data.recentSubmissions.length > 0 ? (
              data.recentSubmissions.slice(0, 6).map((sub: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-surface/30 hover:bg-surface/60 transition-colors">
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-200">{sub.title}</span>
                    <span className="text-xs text-gray-500 mt-1">
                      {new Date(parseInt(sub.timestamp) * 1000).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(sub.status)} ${sub.status.toLowerCase() === 'accepted' ? 'bg-emerald-400/10 border-emerald-400/20' : 'bg-red-400/10 border-red-400/20'}`}>
                      {sub.status}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(sub.difficulty || 'Easy')}`}>
                      {sub.difficulty || 'Easy'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No recent submissions found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeetCodeAnalytics;
