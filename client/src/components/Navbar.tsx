import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { LogOut, User, Menu, X, Brain } from 'lucide-react';
import { useState } from 'react';
import type { RootState } from '../store';
import { logout } from '../store/authSlice';

const Navbar = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await dispatch(logout() as any);
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 w-full glass border-b border-white/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-white">
                DevScope<span className="text-primary">.ai</span>
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {!isAuthenticated ? (
              <>
                <Link to="#features" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Features</Link>
                <Link to="#pricing" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Pricing</Link>
                <Link to="/login" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Log in</Link>
                <Link to="/signup" className="bg-white text-black hover:bg-gray-200 transition-colors px-4 py-2 rounded-full text-sm font-medium">
                  Sign up
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Link 
                  to={user?.role === 'recruiter' ? '/recruiter/search' : '/dashboard'} 
                  className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
                >
                  Dashboard
                </Link>
                <div className="h-4 w-px bg-white/20"></div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full border border-white/20" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                        <User className="w-4 h-4 text-gray-300" />
                      </div>
                    )}
                    <span className="text-sm font-medium text-gray-200">{user?.name}</span>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-colors"
                    title="Log out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-300 hover:text-white p-2"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden glass border-t border-white/5 px-4 pt-2 pb-4 space-y-1">
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/5">Log in</Link>
              <Link to="/signup" className="block px-3 py-2 rounded-md text-base font-medium text-primary hover:text-indigo-400 hover:bg-white/5">Sign up</Link>
            </>
          ) : (
            <>
              <div className="px-3 py-2 flex items-center gap-3 mb-2 border-b border-white/5 pb-3">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-300" />
                </div>
                <div>
                  <div className="text-sm font-medium text-white">{user?.name}</div>
                  <div className="text-xs text-gray-400 capitalize">{user?.role}</div>
                </div>
              </div>
              <Link to={user?.role === 'recruiter' ? '/recruiter/search' : '/dashboard'} className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/5">
                Dashboard
              </Link>
              <button onClick={handleLogout} className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-400 hover:text-red-300 hover:bg-white/5">
                Log out
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
