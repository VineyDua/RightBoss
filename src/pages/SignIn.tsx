// Importing necessary React hooks and components
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Button from '../components/ui/Button'; // Custom UI button
import Input from '../components/ui/Input';   // Custom UI input
import { supabase, testSupabaseConnection } from '../lib/supabase';   // Supabase client instance
import { useUser } from '../contexts/UserContext'; // Custom context for user session
import { useNavigation } from '../hooks/useNavigation';

// Functional component for Sign In page
const SignIn: React.FC = () => {
  const { goTo, goToDashboard, goToSignUp } = useNavigation();
  const location = useLocation(); // Used to check for OAuth callback params
  const { user, isLoading: userContextLoading } = useUser(); // Destructure current user and loading status from UserContext

  // Local state to handle form data
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // Local state to handle error and loading visuals
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'failed'>('checking');

  // Check for OAuth callback errors
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const error = query.get('error');
    const errorDescription = query.get('error_description');
    
    if (error) {
      console.error('OAuth callback error:', error, errorDescription);
      setError(`Authentication failed: ${errorDescription || error}`);
    }
  }, [location]);

  // Check Supabase connection on component mount
  useEffect(() => {
    let mounted = true;
    
    const checkConnection = async () => {
      try {
        const isConnected = await testSupabaseConnection();
        if (mounted) {
          setConnectionStatus(isConnected ? 'connected' : 'failed');
        }
      } catch (err) {
        console.error('Connection check error:', err);
        if (mounted) {
          setConnectionStatus('failed');
        }
      }
    };
    
    checkConnection();
    return () => {
      mounted = false;
    };
  }, []);

  // Redirect user to dashboard if already authenticated
  useEffect(() => {
    console.log('SignIn effect:', { user: !!user, userContextLoading });
    if (!userContextLoading && user) {
      console.log('SignIn: User already authenticated, redirecting to dashboard');
      goToDashboard();
    }
  }, [user, userContextLoading, goToDashboard]);

  // Function to handle Google sign-in
  const handleGoogleSignIn = async () => {
    try {
      console.log('SignIn: Initiating Google sign in...');
      setError(null);
      setGoogleLoading(true);
      
      // Get the current site origin for the redirect
      const site_url = window.location.origin;
      console.log('SignIn: Using redirect URL:', `${site_url}/auth/callback`);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          // Use the standard Supabase auth callback endpoint
          redirectTo: `${site_url}/auth/callback`
        }
      });
      
      if (error) {
        console.error('SignIn: Google sign in error:', error);
        setError(`Google sign in failed: ${error.message}`);
        setGoogleLoading(false);
        return;
      }

      console.log('SignIn: Google sign in initiated:', data);
      // No need to setGoogleLoading(false) here as we're being redirected to Google's auth page
    } catch (err) {
      console.error('SignIn: Unexpected error during Google sign in:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred with Google sign in');
      setGoogleLoading(false);
    }
  };

  // Function to handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return; // Prevent multiple submissions
    
    console.log('SignIn: Handling submit');
    setError(null);
    setLoading(true);

    try {
      console.log('SignIn: Attempting authentication with email:', formData.email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        console.error('SignIn: Authentication error:', error);
        if (error.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please try again.');
        } else if (error.message.includes('Email not confirmed')) {
          setError('Please confirm your email address before signing in.');
        } else {
          setError(error.message);
        }
        return;
      }

      if (!data?.session) {
        console.error('SignIn: No session data returned');
        setError('Failed to create session. Please try again.');
        return;
      }

      console.log('SignIn: Authentication successful, waiting for redirect');
      // Success - the auth state listener will handle the redirect
      
      // Wait a bit for context to update before checking if we need to manually redirect
      setTimeout(() => {
        if (document.visibilityState === 'visible') {
          console.log('SignIn: Manual check for redirect needed');
          goToDashboard();
        }
      }, 1000);
      
    } catch (err) {
      console.error('Error signing in:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred during sign in');
    } finally {
      setLoading(false);
    }
  };

  // Update form state when input values change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Show spinner while auth state is loading
  if (userContextLoading) {
    console.log('SignIn: Showing loading spinner due to userContextLoading', { 
      userContextLoading, 
      formLoading: loading 
    });
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-black to-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // Show connection error if failed
  if (connectionStatus === 'failed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-black to-black flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-gray-900 rounded-xl p-8 shadow-2xl border border-red-800">
          <div className="text-center">
            <div className="inline-flex items-center justify-center mb-6">
              <div className="h-12 w-12 bg-red-600/20 rounded-full flex items-center justify-center">
                <span className="text-red-500">⚠️</span>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Connection Error</h2>
            <p className="text-gray-400 mb-6">
              Unable to connect to the authentication service. Please try again later or contact support if the problem persists.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-purple-600 text-white rounded-lg px-4 py-2 hover:bg-purple-700 transition-colors"
            >
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-black to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header and branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center">
            <div className="h-12 w-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-2xl">R</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mt-6 mb-2">Welcome back</h1>
          <p className="text-gray-400">Sign in to continue to RightBoss</p>
        </div>

        {/* Login form container */}
        <div className="bg-gray-900 rounded-xl p-8 shadow-2xl border border-gray-800">
          {/* Google login button */}
          <Button
            onClick={handleGoogleSignIn}
            type="button"
            variant="outline"
            size="lg"
            fullWidth
            isLoading={googleLoading}
            className="bg-white text-gray-900 hover:bg-gray-50"
          >
            <div className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </div>
          </Button>

          {/* Divider between Google and email login */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-800"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-900 text-gray-500">or</span>
            </div>
          </div>

          {/* Show error if present */}
          {error && (
            <div className="mb-4 p-3 rounded bg-red-900/50 border border-red-800 text-red-200 text-sm">
              {error}
            </div>
          )}

          {/* Email/password form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />

            <Input
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />

            {/* Link to forgot password page */}
            <div className="flex justify-end">
              <Button
                variant="ghost"
                onClick={() => goTo('/forgot-password')}
                className="text-sm text-purple-400 hover:text-purple-300"
              >
                Forgot your password?
              </Button>
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              variant="primary"
              gradient
              fullWidth
              size="lg"
              className="mt-6"
              isLoading={loading} // shows spinner if loading
            >
              Sign In
            </Button>
          </form>

          {/* Redirect to signup if user doesn't have an account */}
          <div className="text-center mt-6">
  <p className="text-white">Don't have an account?</p>
  <div className="mt-2">
    <Button
      variant="ghost"
      onClick={goToSignUp}
      className="text-purple-400 hover:text-purple-300 mx-auto"
    >
      Sign Up
    </Button>
  </div>
</div>

        </div>
      </div>
    </div>
  );
};

export default SignIn;
