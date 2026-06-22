import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { GitBranch, Star, GitFork, BookOpen, Clock, Activity, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

import type { RootState } from '../store';
import { fetchGitHubAnalytics, connectGitHub } from '../store/githubSlice';
import StatsCard from '../components/StatsCard';
import ScoreGauge from '../components/ScoreGauge';
import LoadingSpinner from '../components/LoadingSpinner';

const GitHubAnalytics = () => {
  const dispatch = useDispatch();
  const { data, isLoading, error } = useSelector((state: RootState) => state.github);
  const [username, setUsername] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    dispatch(fetchGitHubAnalytics() as any);
  }, [dispatch]);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setIsConnecting(true);
    try {
      await dispatch(connectGitHub(username) as any).unwrap();
      toast.success('GitHub profile connected successfully!');
    } catch (err: any) {
      toast.error(err || 'Failed to connect GitHub');
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
          <div className="w-20 h-20 bg-[#24292e] rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(36,41,46,0.5)]">
            <GitBranch className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Connect GitHub</h2>
          <p className="text-gray-400 mb-8">
            Connect your GitHub account to analyze your repositories, contributions, and coding consistency.
          </p>

          <form onSubmit={handleConnect} className="space-y-4">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="GitHub Username"
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
        <p className="text-lg font-medium text-gray-300 animate-pulse">Analyzing repositories and contributions...</p>
        <p className="text-sm text-gray-500">This might take a minute for large profiles.</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl">
        <h3 className="text-red-400 font-semibold mb-2">Error loading GitHub data</h3>
        <p className="text-red-300/80 text-sm">{error}</p>
        <button
          onClick={() => dispatch(fetchGitHubAnalytics() as any)}
          className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-sm transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/5 flex flex-col md:flex-row items-center gap-6">
        <img
          src={data.avatarUrl}
          alt={data.username}
          className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-surface shadow-xl"
        />
        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
            <h1 className="text-2xl md:text-3xl font-bold text-white">{data.username}</h1>
            <a href={data.profileUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
              <GitBranch className="w-5 h-5" />
            </a>
          </div>
          <p className="text-gray-400 max-w-2xl mb-4">{data.bio || 'No bio provided.'}</p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">{data.followers}</span>
              <span className="text-gray-500">Followers</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">{data.following}</span>
              <span className="text-gray-500">Following</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">{data.publicRepos}</span>
              <span className="text-gray-500">Public Repos</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-6 mt-6 md:mt-0 md:pl-6 md:border-l border-white/10">
          <ScoreGauge score={data.qualityScore} size={100} label="Quality" colorClass="text-indigo-400" />
          <ScoreGauge score={data.consistencyScore} size={100} label="Consistency" colorClass="text-emerald-400" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Total Stars" value={data.totalStars} icon={Star} />
        <StatsCard title="Total Forks" value={data.totalForks} icon={GitFork} />
        <StatsCard title="Repositories Analyzed" value={data.repos.length} icon={BookOpen} />
        <StatsCard title="Est. Contributions" value={data.totalContributions} icon={Activity} />
      </div>

      {/* Charts & Details Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Activity Chart */}
        <div className="xl:col-span-2 glass-card p-6 rounded-2xl border border-white/5">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-white">Commit Activity (52 Weeks)</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.commitActivity}>
                <defs>
                  <linearGradient id="colorCommits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis
                  dataKey="week"
                  stroke="#64748b"
                  tickFormatter={(val) => {
                    const date = new Date(val);
                    return `${date.toLocaleString('default', { month: 'short' })}`;
                  }}
                  minTickGap={30}
                />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#12121a', borderColor: 'rgba(255,255,255,0.1)' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Area
                  type="monotone"
                  dataKey="commits"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorCommits)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Languages */}
        <div className="glass-card p-6 rounded-2xl border border-white/5">
          <h3 className="text-lg font-semibold text-white mb-6">Top Languages</h3>
          <div className="space-y-4">
            {data.topLanguages.map((lang: any) => (
              <div key={lang.name}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-gray-300">{lang.name}</span>
                  <span className="text-gray-400">{lang.percentage}%</span>
                </div>
                <div className="h-2 w-full bg-surface rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${lang.percentage}%`, backgroundColor: lang.color }}
                  ></div>
                </div>
              </div>
            ))}
            {data.topLanguages.length === 0 && (
              <p className="text-gray-500 text-center py-4">No language data available</p>
            )}
          </div>
        </div>

      </div>

      {/* Top Repositories */}
      <div className="glass-card p-6 rounded-2xl border border-white/5">
        <h3 className="text-lg font-semibold text-white mb-6">Top Repositories</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.repos.sort((a: any, b: any) => b.stars - a.stars).slice(0, 6).map((repo: any) => (
            <a
              href={repo.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              key={repo.name}
              className="p-4 rounded-xl border border-white/5 bg-surface/50 hover:bg-surface hover:border-white/10 transition-all group"
            >
              <h4 className="font-semibold text-indigo-400 group-hover:text-indigo-300 truncate mb-2">{repo.name}</h4>
              <p className="text-sm text-gray-400 line-clamp-2 mb-4 h-10">{repo.description || 'No description provided.'}</p>

              <div className="flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#6366f1' }}></span>
                  {repo.language}
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5" />
                  {repo.stars}
                </div>
                <div className="flex items-center gap-1">
                  <GitFork className="w-3.5 h-3.5" />
                  {repo.forks}
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GitHubAnalytics;
