import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search, Filter, Star, MapPin, Brain, Code2, ExternalLink, Mail, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

import type { RootState } from '../store';
import { searchDevelopers } from '../store/recruiterSlice';
import ScoreGauge from '../components/ScoreGauge';
import LoadingSpinner from '../components/LoadingSpinner';

const RecruiterDashboard = () => {
  const dispatch = useDispatch();
  const { searchResults, isLoading } = useSelector((state: RootState) => state.recruiter);
  
  const [filters, setFilters] = useState({
    query: '',
    skills: '',
    location: '',
    minScore: '',
  });

  // Initial load
  useEffect(() => {
    dispatch(searchDevelopers({}) as any);
  }, [dispatch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const searchParams = {
      ...filters,
      minScore: filters.minScore ? parseInt(filters.minScore) : undefined,
    };
    dispatch(searchDevelopers(searchParams) as any);
  };

  const handleClearFilters = () => {
    setFilters({ query: '', skills: '', location: '', minScore: '' });
    dispatch(searchDevelopers({}) as any);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Talent Search</h1>
        <p className="text-gray-400">Find pre-vetted developers based on verified GitHub and LeetCode analytics.</p>
      </div>

      {/* Search Bar & Filters */}
      <div className="glass-card p-6 rounded-2xl border border-white/5">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-500" />
              </div>
              <input
                type="text"
                value={filters.query}
                onChange={(e) => setFilters({ ...filters, query: e.target.value })}
                placeholder="Search by name, title, or keywords..."
                className="w-full pl-12 pr-4 py-3 bg-surface border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>
            <button
              type="submit"
              className="px-8 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-medium transition-colors whitespace-nowrap"
            >
              Search
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-white/10">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Required Skills</label>
              <input
                type="text"
                value={filters.skills}
                onChange={(e) => setFilters({ ...filters, skills: e.target.value })}
                placeholder="e.g. React, Node.js, Python (comma separated)"
                className="w-full px-4 py-2.5 bg-surface border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Location</label>
              <input
                type="text"
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                placeholder="e.g. San Francisco, Remote"
                className="w-full px-4 py-2.5 bg-surface border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Min. Hiring Score</label>
              <select
                value={filters.minScore}
                onChange={(e) => setFilters({ ...filters, minScore: e.target.value })}
                className="w-full px-4 py-2.5 bg-surface border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-primary transition-all appearance-none"
              >
                <option value="">Any Score</option>
                <option value="60">60+ (Good)</option>
                <option value="75">75+ (Strong)</option>
                <option value="85">85+ (Exceptional)</option>
                <option value="95">95+ (Elite)</option>
              </select>
            </div>
          </div>
          
          {(filters.query || filters.skills || filters.location || filters.minScore) && (
            <div className="flex justify-end pt-2">
              <button 
                type="button" 
                onClick={handleClearFilters}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Clear all filters
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Results */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">
            {isLoading ? 'Searching...' : `${searchResults.total} Candidates Found`}
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Sort by:</span>
            <select className="bg-transparent border-none text-sm text-white focus:ring-0 font-medium cursor-pointer">
              <option className="bg-surface text-white">Hiring Score (High to Low)</option>
              <option className="bg-surface text-white">Recently Active</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="py-20">
            <LoadingSpinner />
          </div>
        ) : searchResults.developers.length > 0 ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {searchResults.developers.map((dev: any) => (
              <CandidateCard key={dev._id} candidate={dev} />
            ))}
          </div>
        ) : (
          <div className="glass-card p-12 rounded-2xl text-center border border-white/5">
            <Search className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No candidates found</h3>
            <p className="text-gray-400 mb-6">Try adjusting your filters or search criteria to find more developers.</p>
            <button 
              onClick={handleClearFilters}
              className="px-6 py-2 bg-surface hover:bg-surface-hover border border-white/10 rounded-xl font-medium transition-colors text-white"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const CandidateCard = ({ candidate }: { candidate: any }) => {
  const { user } = candidate;
  const score = candidate.scores?.overallScore || 0;
  
  return (
    <div className="glass-card p-6 rounded-2xl border border-white/5 hover:border-white/20 transition-all group flex flex-col h-full">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <img 
            src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`} 
            alt={user.name} 
            className="w-16 h-16 rounded-full border-2 border-surface"
          />
          <div>
            <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">{user.name}</h3>
            <p className="text-sm text-gray-400">{candidate.title || 'Software Engineer'}</p>
            {candidate.location && (
              <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                <MapPin className="w-3 h-3" />
                {candidate.location}
              </div>
            )}
          </div>
        </div>
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-lg mb-1">
            {score}
          </div>
          <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Score</div>
        </div>
      </div>

      <div className="mb-6 flex-1">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Top Skills</h4>
        <div className="flex flex-wrap gap-2">
          {candidate.skills && candidate.skills.length > 0 ? (
            candidate.skills.slice(0, 6).map((skill: string) => (
              <span key={skill} className="px-2.5 py-1 rounded-md bg-surface border border-white/10 text-gray-300 text-xs font-medium">
                {skill}
              </span>
            ))
          ) : (
            <span className="text-sm text-gray-500">No skills listed</span>
          )}
          {candidate.skills && candidate.skills.length > 6 && (
            <span className="px-2.5 py-1 rounded-md bg-surface border border-white/5 text-gray-500 text-xs font-medium">
              +{candidate.skills.length - 6} more
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
            <Brain className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-0.5">GitHub</div>
            <div className="text-sm font-semibold text-white">{candidate.scores?.breakdown?.github?.score || 'N/A'}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <Code2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-0.5">LeetCode</div>
            <div className="text-sm font-semibold text-white">{candidate.scores?.breakdown?.dsa?.score || 'N/A'}</div>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button className="flex-1 py-2.5 bg-white text-black font-medium rounded-xl text-sm hover:bg-gray-200 transition-colors">
          View Full Profile
        </button>
        <button className="p-2.5 bg-surface hover:bg-surface-hover border border-white/10 rounded-xl text-gray-300 hover:text-white transition-colors" title="Save Candidate">
          <Star className="w-5 h-5" />
        </button>
        <button className="p-2.5 bg-surface hover:bg-surface-hover border border-white/10 rounded-xl text-gray-300 hover:text-white transition-colors" title="Contact">
          <Mail className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default RecruiterDashboard;
