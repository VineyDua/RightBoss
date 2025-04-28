import React from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, ArrowRight, LogOut } from 'lucide-react';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import { useUser } from '../../contexts/UserContext';
import { supabase } from '../../lib/supabase';
import { useNavigation } from '../../hooks/useNavigation';

interface HeaderProps {
  user?: {
    name: string;
    profilePicture?: string;
  } | null;
  simplified?: boolean; // New prop for simplified header during onboarding
}

const Header: React.FC<HeaderProps> = ({ user: propUser, simplified = false }) => {
  const { user, profile } = useUser();
  const { goTo, goToDashboard, goToProfile, goToSignIn, goToSignUp } = useNavigation();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const location = useLocation();
  const profileRef = React.useRef<HTMLDivElement>(null);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleProfile = () => setIsProfileOpen(!isProfileOpen);

  const handleSignOut = async () => {
    console.log('Sign out initiated...');
    try {
      // Clear ALL localStorage flags to prevent redirect issues after login
      localStorage.removeItem('force_onboarding');
      localStorage.removeItem('force_onboarding_timestamp');
      localStorage.removeItem('onboarding_complete');
      localStorage.removeItem('debug_mode');
      localStorage.removeItem('last_profile_update');
      console.log('Cleared all localStorage flags for clean sign out');
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error signing out:', error);
        return;
      }
      
      console.log('Sign out successful');
      setIsProfileOpen(false);
      goToSignIn();
    } catch (error) {
      console.error('Unexpected error during sign out:', error);
    }
  };

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const navLinks = [
    { name: 'Dashboard', onClick: goToDashboard },
    { name: 'Interviews', onClick: () => goTo('/interviews') },
    { name: 'Matches', onClick: () => goTo('/matches') },
    { name: 'Profile', onClick: () => goToProfile() },
  ];

  // Get display name from profile or user email
  const displayName = profile?.full_name || user?.email || '';

  // Check if we're in an onboarding route
  const isOnboardingRoute = location.pathname.includes('onboarding');

  return (
    <header className={`bg-gray-900 border-b border-gray-800 ${simplified ? 'py-2' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <button onClick={goToDashboard} className="flex-shrink-0 flex items-center">
              <div className="h-8 w-8 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">R</span>
              </div>
              <span className="ml-2 text-white font-bold text-xl">RightBoss</span>
            </button>
            
            {/* Only show nav links if not in simplified mode */}
            {!simplified && (
              <nav className="hidden md:ml-8 md:flex md:space-x-6">
                {user && navLinks.map((link) => (
                  <button
                    key={link.name}
                    onClick={link.onClick}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                      location.pathname === `/${link.name.toLowerCase()}` || 
                      (link.name === 'Profile' && location.pathname.startsWith('/profile'))
                        ? 'text-white bg-gray-800'
                        : 'text-gray-300 hover:text-white hover:bg-gray-700'
                    }`}
                  >
                    {link.name}
                  </button>
                ))}
              </nav>
            )}
          </div>
          
          <div className="flex items-center">
            {user ? (
              simplified ? (
                // Simplified user controls for onboarding
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleSignOut}
                  className="text-gray-300 hover:text-white"
                  leftIcon={<LogOut className="h-4 w-4" />}
                >
                  Sign Out
                </Button>
              ) : (
                // Normal user profile dropdown
                <div className="ml-3 relative" ref={profileRef}>
                  <div>
                    <button
                      onClick={toggleProfile}
                      className="flex items-center max-w-xs bg-gray-800 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                    >
                      <span className="sr-only">Open user menu</span>
                      <div className="flex items-center space-x-2 px-2 py-1 rounded-full hover:bg-gray-700">
                        <Avatar src={propUser?.profilePicture} alt={displayName} size="sm" />
                        <span className="text-gray-300 font-medium hidden sm:block">
                          {displayName}
                        </span>
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      </div>
                    </button>
                  </div>
                  
                  {isProfileOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-gray-800 ring-1 ring-black ring-opacity-5 z-10">
                      <button 
                        onClick={() => {
                          goToProfile();
                          setIsProfileOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                      >
                        Your Profile
                      </button>
                      <button 
                        onClick={() => {
                          goTo('/settings');
                          setIsProfileOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                      >
                        Settings
                      </button>
                      <button
                        onClick={handleSignOut}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                      >
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              )
            ) : (
              <div className="flex items-center md:ml-6 space-x-3">
                <Button variant="ghost" size="sm" onClick={goToSignIn}>
                  Sign In
                </Button>
                <Button variant="primary" size="sm" gradient onClick={goToSignUp}>
                  <span className="flex items-center">
                    Match <ArrowRight className="ml-1 h-4 w-4" />
                  </span>
                </Button>
              </div>
            )}
            
            {!simplified && (
              <div className="flex md:hidden ml-3">
                <button
                  onClick={toggleMenu}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                >
                  <span className="sr-only">Open main menu</span>
                  {isMenuOpen ? (
                    <X className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Menu className="block h-6 w-6" aria-hidden="true" />
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile menu - only show if not in simplified mode */}
      {!simplified && isMenuOpen && (
        <div className="md:hidden bg-gray-900 pb-3 border-t border-gray-700">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {user ? (
              <>
                {navLinks.map((link) => (
                  <button
                    key={link.name}
                    onClick={() => {
                      link.onClick();
                      setIsMenuOpen(false);
                    }}
                    className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                      location.pathname === `/${link.name.toLowerCase()}` || 
                      (link.name === 'Profile' && location.pathname.startsWith('/profile'))
                        ? 'text-white bg-gray-800'
                        : 'text-gray-300 hover:text-white hover:bg-gray-700'
                    }`}
                  >
                    {link.name}
                  </button>
                ))}
                <button
                  onClick={() => {
                    handleSignOut();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
                >
                  Sign out
                </button>
              </>
            ) : (
              <div className="space-y-2 px-3 py-2">
                <Button variant="outline" fullWidth onClick={goToSignIn}>
                  Sign In
                </Button>
                <Button variant="primary" fullWidth gradient onClick={goToSignUp}>
                  <span className="flex items-center">
                    Match <ArrowRight className="ml-1 h-4 w-4" />
                  </span>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;