import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { GitBranch, Code2, FileText, ArrowRight, Brain, Target, Activity } from 'lucide-react';
import type { RootState } from '../store';
import { fetchHiringReadiness } from '../store/careerSlice';
import ScoreGauge from '../components/ScoreGauge';
import StatsCard from '../components/StatsCard';
import LoadingSpinner from '../components/LoadingSpinner';

const DeveloperDashboard = () => {
  const dispatch = useDispatch();
  const { readiness, isLoading } = useSelector((state: RootState) => state.career);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(fetchHiringReadiness() as any);
  }, [dispatch]);

  if (isLoading && !readiness) {
    return <LoadingSpinner fullScreen />;
  }

  const { overallScore = 0, breakdown, placementProbability, level } = readiness || {};

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {user?.name?.split(' ')[0]}</h1>
        <p className="text-gray-400">Here's your latest portfolio analytics overview.</p>
      </div>

      {/* Main Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 glass-card p-6 rounded-2xl flex flex-col items-center justify-center">
          <ScoreGauge
            score={overallScore}
            size={180}
            label="Hiring Readiness"
            sublabel={level}
            colorClass="text-primary"
          />
        </div>
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <StatsCard
            title="Placement Probability"
            value={placementProbability || 'N/A'}
            icon={Target}
          />
          <StatsCard
            title="Profile Level"
            value={level || 'Not Started'}
            icon={Brain}
          />
          <StatsCard
            title="Open Source Score"
            value={breakdown?.openSource?.score || 0}
            icon={GitBranch}
          />
          <StatsCard
            title="Consistency Score"
            value={breakdown?.consistency?.score || 0}
            icon={Activity}
          />
        </div>
      </div>

      {/* Connection Modules */}
      <h2 className="text-xl font-bold text-white mt-12 mb-6">Your Integrations</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* GitHub Card */}
        <div className="glass-card p-6 rounded-2xl border border-white/5 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-[#24292e] flex items-center justify-center">
              <GitBranch className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">GitHub</h3>
              <p className="text-xs text-gray-400">Code & Contributions</p>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center py-4">
            <ScoreGauge
              score={breakdown?.github?.score || 0}
              size={100}
              colorClass="text-indigo-400"
            />
          </div>
          <div className="mt-auto pt-4 border-t border-white/10">
            <Link to="/github" className="flex items-center justify-between text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
              <span>View Analytics</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* LeetCode Card */}
        <div className="glass-card p-6 rounded-2xl border border-white/5 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-[#ffa116]/20 flex items-center justify-center border border-[#ffa116]/30">
              <Code2 className="w-6 h-6 text-[#ffa116]" />
            </div>
            <div>
              <h3 className="font-semibold text-white">LeetCode</h3>
              <p className="text-xs text-gray-400">DSA Readiness</p>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center py-4">
            <ScoreGauge
              score={breakdown?.dsa?.score || 0}
              size={100}
              colorClass="text-emerald-400"
            />
          </div>
          <div className="mt-auto pt-4 border-t border-white/10">
            <Link to="/leetcode" className="flex items-center justify-between text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
              <span>View Stats</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Resume Card */}
        <div className="glass-card p-6 rounded-2xl border border-white/5 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
              <FileText className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Resume</h3>
              <p className="text-xs text-gray-400">ATS & Quality</p>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center py-4">
            <ScoreGauge
              score={breakdown?.resume?.score || 0}
              size={100}
              colorClass="text-blue-400"
            />
          </div>
          <div className="mt-auto pt-4 border-t border-white/10">
            <Link to="/resume" className="flex items-center justify-between text-sm text-blue-400 hover:text-blue-300 transition-colors">
              <span>View Analyzer</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};


export default DeveloperDashboard;
