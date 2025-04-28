import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { supabase } from '../lib/supabase';
import { useUser } from '../contexts/UserContext';
import { useNavigation } from '../hooks/useNavigation';

// Debug helper function
const debugLog = (message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  if (data) {
    console.log(`[${timestamp}] [SIGNUP DEBUG] ${message}`, data);
  } else {
    console.log(`[${timestamp}] [SIGNUP DEBUG] ${message}`);
  }
};

// Error logging helper
const errorLog = (message: string, error: any) => {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] [SIGNUP ERROR] ${message}`, error);
  
  // Extract more detailed error information
  if (error) {
    if (error.code) console.error(`Error code: ${error.code}`);
    if (error.details) console.error(`Error details: ${error.details}`);
    if (error.hint) console.error(`Error hint: ${error.hint}`);
    if (error.message) console.error(`Error message: ${error.message}`);
    
    // Try to extract Supabase-specific error details
    const pgError = error.details?.includes('duplicate key') ? 'Possible duplicate record' : '';
    if (pgError) console.error(`Postgres error: ${pgError}`);
  }
};

// Function to test Supabase connection
const testSupabaseConnection = async () => {
  try {
    debugLog('Testing Supabase API connection...');
    
    // Don't use direct fetch - it causes CORS issues
    // Instead, use Supabase client's built-in methods which handle CORS correctly
    try {
      // Use a lightweight ping method through the Supabase client
      const { error } = await supabase.rpc('ping_db', {});
      
      // If the function doesn't exist, try a simple query instead
      if (error && error.message && error.message.includes('function "ping_db" does not exist')) {
        debugLog('Ping function not available, trying table query instead');
        // Fall through to the next approach
      } else if (!error) {
        // Ping succeeded
        debugLog('Supabase connection test successful via RPC');
        return true;
      }
      
      // Try fetching auth config as a fallback - this is a lightweight endpoint
      const { data, error: configError } = await supabase.auth.getSession();
      
      if (configError) {
        // Only report actual network errors, not auth errors
        if (configError.message && (
            configError.message.includes('Failed to fetch') || 
            configError.message.includes('NetworkError') ||
            configError.message.includes('network')
        )) {
          errorLog('Network error connecting to Supabase', configError);
          return false;
        }
      }
      
      // If we got here, the connection works even if auth has other issues
      debugLog('Supabase connection is working');
      return true;
      
    } catch (error) {
      // Only consider it a connection error if it's a network-related error
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || 
            error.message.includes('NetworkError') ||
            error.message.includes('network')) {
          errorLog('Network error connecting to Supabase', error);
          return false;
        }
      }
      
      // For all other errors, the server is responding, so connection is fine
      debugLog('Supabase connection is working (though with errors)');
      return true;
    }
  } catch (err) {
    errorLog('General error testing Supabase connection', err);
    return false;
  }
};

const SignUp: React.FC = () => {
  debugLog('Component mounted');
  
  const { goTo, goToDashboard, goToSignIn, goToOnboarding } = useNavigation();
  const location = useLocation();
  const { user, isLoading } = useUser();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [lastSignUpAttempt, setLastSignUpAttempt] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<boolean | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Test Supabase connection on mount, but with a better approach
  useEffect(() => {
    let isMounted = true;
    
    const checkConnection = async () => {
      // Wait until the browser has fully loaded the page
      if (document.readyState !== 'complete') {
        debugLog('Document not fully loaded, delaying connection check');
        setTimeout(checkConnection, 1000);
        return;
      }
      
      try {
        const status = await testSupabaseConnection();
        if (isMounted) {
          // Only update if definitely disconnected
          if (status === false) {
            setConnectionStatus(false);
            debugLog('Supabase connection test failed');
          } else {
            setConnectionStatus(true);
            debugLog('Supabase connection test passed');
          }
        }
      } catch (e) {
        errorLog('Error during connection test', e);
        if (isMounted) {
          setConnectionStatus(false);
        }
      }
    };
    
    // Delay slightly to avoid immediate execution
    const timer = setTimeout(checkConnection, 1500);
    
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []);

  // If user is already logged in, redirect to dashboard
  useEffect(() => {
    debugLog(`User auth state change detected - isLoading: ${isLoading}, user: ${user ? 'exists' : 'null'}`);
    if (!isLoading && user) {
      debugLog('User already logged in, redirecting to dashboard');
      goToDashboard();
    }
  }, [user, isLoading, goToDashboard]);

  // Handle rate limiting countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (lastSignUpAttempt) {
      interval = setInterval(() => {
        const elapsed = Date.now() - lastSignUpAttempt;
        const remaining = Math.max(0, Math.ceil((10000 - elapsed) / 1000));
        setTimeRemaining(remaining);
        
        if (remaining === 0) {
          debugLog('Rate limit countdown complete');
          clearInterval(interval);
        }
      }, 100);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [lastSignUpAttempt]);

  // Check for OAuth callback errors
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const error = query.get('error');
    const errorDescription = query.get('error_description');
    
    if (error) {
      errorLog('OAuth callback error detected', { error, errorDescription });
      setError(`Authentication failed: ${errorDescription || error}`);
    }
  }, [location]);

  const canAttemptSignUp = !lastSignUpAttempt || (Date.now() - lastSignUpAttempt) >= 10000;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    debugLog('Sign up form submitted', { email: formData.email, fullName: formData.fullName });

    if (!canAttemptSignUp) {
      debugLog('Rate limit active, preventing signup attempt');
      setError(`Please wait ${timeRemaining} seconds before trying again`);
      return;
    }

    // Basic validation
    if (formData.password.length < 8) {
      debugLog('Password validation failed - too short');
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    setLastSignUpAttempt(Date.now());
    
    // Verify connection before proceeding
    if (connectionStatus === false) {
      debugLog('Retesting connection before signup attempt');
      const reconnected = await testSupabaseConnection();
      setConnectionStatus(reconnected);
      if (!reconnected) {
        setError('Cannot connect to the server. Please check your internet connection and try again.');
        setLoading(false);
        return;
      }
    }
    
    debugLog('Starting signup process - passed initial validation');

    try {
      // SIMPLIFIED APPROACH: ONLY handle auth signup and rely on database trigger
      debugLog('Executing auth.signUp with credentials and user metadata');
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
          },
          // Add important options
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (authError) {
        errorLog('Auth signup returned error', authError);
        
        // Handle specific auth errors
        if (authError.status === 500 || (authError.message && authError.message.includes('server'))) {
          if (retryCount < 2) {
            // Automatically retry for server errors
            debugLog(`Server error detected. Attempting retry #${retryCount + 1}`);
            setRetryCount(prev => prev + 1);
            // Short delay before retry
            await new Promise(resolve => setTimeout(resolve, 1500));
            // Recursive call to retry
            handleSubmit(e);
            return;
          } else {
            // After retries, show a more helpful message
            setError('The server is experiencing issues. This is not your fault. Please try again in a few minutes.');
            setRetryCount(0);
            setLoading(false);
            return;
          }
        }
        
        throw authError;
      }

      if (!authData || !authData.user) {
        errorLog('Auth signup returned no data or user', { authData });
        throw new Error('No user data returned from signup');
      }

      debugLog('Auth signup successful', { 
        userId: authData.user?.id,
        email: authData.user?.email,
        emailConfirmed: authData.user?.email_confirmed_at ? 'yes' : 'no'
      });

      // Set a flag in localStorage to force onboarding flow
      localStorage.setItem('force_onboarding', 'true');
      localStorage.setItem('force_onboarding_timestamp', Date.now().toString());
      debugLog('Set force_onboarding flag in localStorage');

      // Check if email confirmation is pending
      if (authData.user && !authData.user.email_confirmed_at) {
        debugLog('Email confirmation required, showing email sent screen');
        setEmailSent(true);
        setRetryCount(0);
        return;
      }

      // Redirect to onboarding instead of dashboard
      debugLog('No email confirmation needed, redirecting to force-onboarding');
      goToOnboarding();
      
    } catch (err) {
      errorLog('Error during signup process', err);
      
      // Try to provide more context for the error
      let errorMessage = 'An error occurred during signup';
      
      if (err instanceof Error) {
        errorMessage = err.message;
        
        // Add additional context for specific error types
        if (errorMessage.includes('duplicate key') || errorMessage.includes('already registered')) {
          errorMessage = 'An account with this email already exists';
        } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
          errorMessage = 'Network error - please check your internet connection';
        } else if (errorMessage.includes('500') || errorMessage.includes('server error')) {
          errorMessage = 'The server is currently unavailable. Please try again later.';
        } else if (errorMessage.includes('rate limit')) {
          errorMessage = 'Too many attempts. Please wait a moment and try again.';
        }
      }
      
      setError(errorMessage);
      setRetryCount(0);
    } finally {
      debugLog('Signup process complete (success or failure)');
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handler for Google sign-up
  const handleGoogleSignUp = async () => {
    try {
      debugLog('Initiating Google sign up');
      setError(null);
      setGoogleLoading(true);
      
      // Verify connection before proceeding
      if (connectionStatus === false) {
        const reconnected = await testSupabaseConnection();
        setConnectionStatus(reconnected);
        if (!reconnected) {
          setError('Cannot connect to the server. Please check your internet connection and try again.');
          setGoogleLoading(false);
          return;
        }
      }
      
      // Get the current site origin for the redirect
      const site_url = window.location.origin;
      debugLog('Using redirect URL with force parameter');
      
      // Use the standard Supabase auth callback endpoint
      const redirectPath = `${site_url}/auth/callback?redirect_to=/force-onboarding`;
      debugLog('Using redirect URL with force parameter', { redirectUrl: redirectPath });
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          // Force redirect to force-onboarding path
          redirectTo: redirectPath
        }
      });
      
      if (error) {
        errorLog('Google sign up returned error', error);
        
        // Handle specific Google auth errors
        if (error.status === 500 || (error.message && error.message.includes('server'))) {
          setError('The server is experiencing issues. Please try again in a few minutes.');
        } else {
          setError(`Google sign up failed: ${error.message}`);
        }
        
        setGoogleLoading(false);
        return;
      }

      debugLog('Google sign up initiated successfully', data);
      
      // Set a flag in localStorage to force onboarding flow for when the OAuth redirect returns
      localStorage.setItem('force_onboarding', 'true');
      localStorage.setItem('force_onboarding_timestamp', Date.now().toString());
      debugLog('Set force_onboarding flag in localStorage for Google sign-up');
      
      // Redirect happens automatically
    } catch (err) {
      errorLog('Unexpected error during Google sign up', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred with Google sign up');
      setGoogleLoading(false);
    }
  };

  if (emailSent) {
    debugLog('Rendering email sent confirmation screen');
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-black to-black flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-gray-900 rounded-xl p-8 shadow-2xl border border-gray-800 text-center">
            <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Check your email</h2>
            <p className="text-gray-400 mb-6">
              We've sent a confirmation link to <strong>{formData.email}</strong>. 
              Please check your email and click the link to activate your account.
            </p>
            <Button variant="outline" fullWidth onClick={goToSignIn}>
              Return to Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  debugLog('Rendering signup form');
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-black to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center">
            <div className="h-12 w-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-2xl">R</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mt-6 mb-2">Get matched today.</h1>
          <p className="text-gray-400">Connect directly with company leadership</p>
        </div>

        <div className="bg-gray-900 rounded-xl p-8 shadow-2xl border border-gray-800">
          {connectionStatus === false && (
            <div className="mb-4 p-3 rounded bg-yellow-900/50 border border-yellow-800 text-yellow-200 text-sm">
              Warning: Connection to server is currently unavailable. Sign-up may not work properly.
            </div>
          )}
          
          <Button
            onClick={handleGoogleSignUp}
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

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-800"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-900 text-gray-500">or</span>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded bg-red-900/50 border border-red-800 text-red-200 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              name="fullName"
              type="text"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />

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
              placeholder="Create a password (min 8 characters)"
              required
              minLength={8}
            />

            <Button
              type="submit"
              variant="primary"
              gradient
              fullWidth
              size="lg"
              className="mt-6"
              isLoading={loading}
              disabled={!canAttemptSignUp || loading}
            >
              {!canAttemptSignUp 
                ? `Wait ${timeRemaining}s to try again` 
                : 'Sign Up'
              }
            </Button>
          </form>
          <div className="text-center mt-6">
  <p className="text-white">Already have an account?</p>
  <div className="mt-2">
    <Button
      variant="ghost"
      onClick={goToSignIn}
      className="text-purple-400 hover:text-purple-300 mx-auto"
    >
      Sign In
    </Button>
  </div>
</div>

  </div>
      </div>
    </div>
  );
};

export default SignUp;