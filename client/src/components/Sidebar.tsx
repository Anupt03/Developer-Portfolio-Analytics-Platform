import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  GitBranch,
  Code2,
  FileText,
  Brain,
  Settings,
  Users,
  Search
} from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

const Sidebar = () => {
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);

  const developerLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'GitHub Analytics', path: '/github', icon: GitBranch },
    { name: 'LeetCode Stats', path: '/leetcode', icon: Code2 },
    { name: 'Resume Analyzer', path: '/resume', icon: FileText },
    { name: 'AI Career Coach', path: '/career', icon: Brain },
  ];

  const recruiterLinks = [
    { name: 'Search Talent', path: '/recruiter/search', icon: Search },
    { name: 'Compare Candidates', path: '/recruiter/compare', icon: Users },
  ];

  const links = user?.role === 'recruiter' ? recruiterLinks : developerLinks;

  return (
    <aside className="w-64 fixed h-[calc(100vh-4rem)] left-0 top-16 border-r border-white/5 glass hidden lg:block overflow-y-auto">
      <div className="p-6">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Menu
        </div>
        <nav className="space-y-2">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;

            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                    ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-transparent'
                  }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-400' : ''}`} />
                <span className="font-medium">{link.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-8 mb-4">
          Preferences
        </div>
        <nav className="space-y-2">
          <Link
            to="/settings"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${location.pathname === '/settings'
                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-transparent'
              }`}
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium">Settings</span>
          </Link>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
