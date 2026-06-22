import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Brain, Target, ArrowRight, Lightbulb, AlertTriangle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

import type { RootState } from '../store';
import { fetchCareerInsights } from '../store/careerSlice';
import LoadingSpinner from '../components/LoadingSpinner';

const CareerCoach = () => {
  const dispatch = useDispatch();
  const { insights, isLoading, error } = useSelector((state: RootState) => state.career);
  const { data: githubData } = useSelector((state: RootState) => state.github);
  const { data: leetcodeData } = useSelector((state: RootState) => state.leetcode);
  const { data: resumeData } = useSelector((state: RootState) => state.resume);

  useEffect(() => {
    dispatch(fetchCareerInsights() as any);
  }, [dispatch]);

  const hasMissingData = !githubData || !leetcodeData || !resumeData;

  if (isLoading && !insights) {
    return <LoadingSpinner fullScreen />;
  }

  if (error && !insights) {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl">
        <h3 className="text-red-400 font-semibold mb-2">Error loading Career Insights</h3>
        <p className="text-red-300/80 text-sm">{error}</p>
        <button 
          onClick={() => dispatch(fetchCareerInsights() as any)}
          className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-sm transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'text-red-400 border-red-400/30 bg-red-400/10';
      case 'medium': return 'text-amber-400 border-amber-400/30 bg-amber-400/10';
      case 'low': return 'text-blue-400 border-blue-400/30 bg-blue-400/10';
      default: return 'text-gray-400 border-gray-400/30 bg-gray-400/10';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'github': return <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400"><Brain className="w-5 h-5" /></div>;
      case 'leetcode': return <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400"><Target className="w-5 h-5" /></div>;
      case 'resume': return <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400"><Lightbulb className="w-5 h-5" /></div>;
      default: return <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400"><Brain className="w-5 h-5" /></div>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="glass-card p-8 rounded-3xl border border-white/5 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-purple-500/20 rounded-full blur-[80px] pointer-events-none transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">AI Career Coach</h1>
          </div>
          <p className="text-gray-400 max-w-3xl text-lg leading-relaxed">
            Personalized, actionable insights generated from your combined GitHub, LeetCode, and Resume data to help you level up your career.
          </p>
        </div>
      </div>

      {/* Missing Data Warning */}
      {hasMissingData && (
        <div className="glass-card p-6 rounded-2xl border border-amber-500/30 bg-amber-500/5">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-1" />
            <div>
              <h3 className="text-amber-400 font-semibold text-lg mb-2">Incomplete Profile Data</h3>
              <p className="text-gray-300 mb-4">Your career insights are currently based on incomplete data. For the most accurate and personalized AI coaching, please connect all your profiles.</p>
              <div className="flex flex-wrap gap-3">
                {!githubData && (
                  <Link to="/github" className="px-4 py-2 bg-surface hover:bg-surface-hover border border-white/10 rounded-lg text-sm text-white transition-colors">
                    Connect GitHub
                  </Link>
                )}
                {!leetcodeData && (
                  <Link to="/leetcode" className="px-4 py-2 bg-surface hover:bg-surface-hover border border-white/10 rounded-lg text-sm text-white transition-colors">
                    Connect LeetCode
                  </Link>
                )}
                {!resumeData && (
                  <Link to="/resume" className="px-4 py-2 bg-surface hover:bg-surface-hover border border-white/10 rounded-lg text-sm text-white transition-colors">
                    Upload Resume
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Insights List */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-white mb-4">Actionable Recommendations</h2>
        
        {insights && insights.length > 0 ? (
          insights.map((insight: any, index: number) => (
            <div key={index} className="glass-card p-6 md:p-8 rounded-2xl border border-white/5 hover:border-white/10 transition-colors group">
              <div className="flex flex-col md:flex-row gap-6">
                
                {/* Left side: Icon & Meta */}
                <div className="flex flex-row md:flex-col items-center md:items-start justify-between md:justify-start gap-4 md:w-48 shrink-0 border-b md:border-b-0 md:border-r border-white/10 pb-4 md:pb-0 md:pr-6">
                  {getCategoryIcon(insight.category)}
                  <div className="flex gap-2 md:flex-col">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border uppercase tracking-wider ${getPriorityColor(insight.priority)}`}>
                      {insight.priority} Priority
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium border border-white/10 bg-surface text-gray-400 uppercase tracking-wider">
                      {insight.category}
                    </span>
                  </div>
                </div>

                {/* Right side: Content */}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-primary transition-colors">{insight.title}</h3>
                  <p className="text-gray-300 leading-relaxed mb-6">{insight.description}</p>
                  
                  <div className="bg-surface/50 rounded-xl p-5 border border-white/5">
                    <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Action Steps</h4>
                    <ul className="space-y-3">
                      {insight.actionItems.map((item: string, i: number) => (
                        <li key={i} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                          <span className="text-gray-200">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

              </div>
            </div>
          ))
        ) : (
          <div className="glass-card p-12 rounded-2xl text-center border border-white/5">
            <Lightbulb className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Insights Available</h3>
            <p className="text-gray-400">Connect your profiles to receive personalized career coaching.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CareerCoach;
