import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext';
import { ProfileProvider } from './contexts/ProfileContext';
import { ThemeProvider } from './contexts/ThemeContext';
import PrivateRoute from './components/PrivateRoute';
import LoadingScreen from './components/ui/LoadingScreen';
import DebugControllerProvider from './components/ui/DebugController';
import Home from './pages/Home';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import Dashboard from './pages/Dashboard';
import JobDetails from './pages/JobDetails';
import AuthCallback from './components/AuthCallback';
import UnifiedProfileExperience from './pages/UnifiedProfileExperience';

function App() {
  // Clean up any stale flags on app startup
  React.useEffect(() => {
    // Check if the last login was more than 12 hours ago
    const lastLogin = localStorage.getItem('last_login_timestamp');
    const currentTime = Date.now();
    
    if (!lastLogin || (currentTime - parseInt(lastLogin)) > 1000 * 60 * 60 * 12) {
      // Clear all potential flag conflicts
      console.log('App: Clearing stale flags on startup');
      localStorage.removeItem('force_onboarding');
      localStorage.removeItem('force_onboarding_timestamp');
      localStorage.removeItem('onboarding_complete');
      localStorage.removeItem('debug_mode');
      localStorage.removeItem('show_debug_banners');
      
      // Set new login timestamp
      localStorage.setItem('last_login_timestamp', currentTime.toString());
    }
  }, []);
  
  return (
    <Router>
      <UserProvider>
        <ProfileProvider>
          <ThemeProvider>
            <DebugControllerProvider initiallyEnabled={false}>
              <React.Suspense fallback={<LoadingScreen />}>
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/signup" element={<SignUp />} />
                  <Route path="/signin" element={<SignIn />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />

                  {/* Protected routes with intelligent routing */}
                  <Route
                    path="/profile"
                    element={
                      <PrivateRoute>
                        <UnifiedProfileExperience initialMode="profile" />
                      </PrivateRoute>
                    }
                  />

                  {/* Unified Profile Experience - handles both onboarding and profile editing */}
                  <Route
                    path="/onboarding"
                    element={
                      <PrivateRoute>
                        <UnifiedProfileExperience initialMode="onboarding" />
                      </PrivateRoute>
                    }
                  />

                  <Route
                    path="/profile/edit"
                    element={
                      <PrivateRoute>
                        <UnifiedProfileExperience initialMode="profile" />
                      </PrivateRoute>
                    }
                  />

                  {/* Dashboard and other app routes */}
                  <Route
                    path="/dashboard"
                    element={
                      <PrivateRoute>
                        <Dashboard />
                      </PrivateRoute>
                    }
                  />
                  
                  <Route
                    path="/jobs/:jobId"
                    element={
                      <PrivateRoute>
                        <JobDetails />
                      </PrivateRoute>
                    }
                  />

                  {/* Fallback redirect */}
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </React.Suspense>
            </DebugControllerProvider>
          </ThemeProvider>
        </ProfileProvider>
      </UserProvider>
    </Router>
  );
}

export default App;