import React, { useEffect, useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { supabase } from '../lib/supabase';
import LoadingScreen from './ui/LoadingScreen';
import { useNavigation } from '../hooks/useNavigation';

const AuthCallback: React.FC = () => {
  const { goTo } = useNavigation();
  const { user, isLoading } = useUser();
  const [checkingOnboarding, setCheckingOnboarding] = useState(false);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);
  const [redirectError, setRedirectError] = useState<string | null>(null);
  
  // Debug flag - TEMPORARY FOR TESTING
  const [debugRedirectDelay] = useState(1500);

  useEffect(() => {
    console.log('%c AuthCallback: Component mounted', 'background: #035; color: yellow', { 
      user: !!user, 
      userId: user?.id,
      email: user?.email,
      isLoading
    });
    
    const checkUserOnboarding = async (userId: string) => {
      try {
        setCheckingOnboarding(true);
        console.log('%c AuthCallback: Checking onboarding status for user', 'background: #035; color: yellow', userId);
        
        // Check if this user already has onboarding data
        const { data, error } = await supabase
          .from('user_onboarding')
          .select('completed, completed_steps')
          .eq('user_id', userId)
          .maybeSingle();
          
        if (error) {
          console.error('%c AuthCallback: Error checking onboarding status:', 'background: #800; color: white', error);
          setRedirectError('Error checking your profile status.');
          setRedirectPath('/onboarding');
          return;
        }
        
        // Log the actual data returned for debugging
        console.log('%c AuthCallback: Onboarding data received:', 'background: #035; color: yellow', data);
        
        // Double-check data structure
        if (!data) {
          console.log('%c AuthCallback: No onboarding data found, redirecting to onboarding', 'background: #035; color: yellow');
          setRedirectPath('/onboarding');
        } else {
          const isCompleted = data.completed === true;
          const hasSteps = Array.isArray(data.completed_steps) && data.completed_steps.length > 0;
          
          console.log('%c AuthCallback: Onboarding status details:', 'background: #035; color: yellow', { 
            isCompleted, 
            hasSteps, 
            steps: data.completed_steps 
          });
          
          if (!isCompleted) {
            console.log('%c AuthCallback: Onboarding not completed, redirecting to onboarding', 'background: #035; color: yellow');
            setRedirectPath('/onboarding');
          } else {
            console.log('%c AuthCallback: Onboarding is completed, redirecting to dashboard', 'background: #035; color: yellow');
            setRedirectPath('/dashboard');
          }
        }
      } catch (err) {
        console.error('%c AuthCallback: Unexpected error in checkUserOnboarding:', 'background: #800; color: white', err);
        setRedirectError('Unexpected error checking your profile.');
        setRedirectPath('/onboarding');
      } finally {
        setCheckingOnboarding(false);
      }
    };
    
    // If not loading and we have a user, they've been authenticated
    if (!isLoading && user) {
      console.log('%c AuthCallback: User authenticated, checking onboarding status', 'background: #035; color: yellow');
      checkUserOnboarding(user.id);
    } 
    // If not loading and no user, something went wrong
    else if (!isLoading && !user) {
      console.error('%c AuthCallback: Authentication failed or no user present', 'background: #800; color: white');
      setRedirectError('Authentication failed.');
      setRedirectPath('/signin');
    }
  }, [user, isLoading]);

  // Once we have a redirect path, actually perform the redirect
  useEffect(() => {
    if (redirectPath) {
      console.log(`%c AuthCallback: Performing redirect to ${redirectPath} after delay of ${debugRedirectDelay}ms`, 'background: #035; color: yellow');
      
      // Add a deliberate delay for debugging purposes
      const timer = setTimeout(() => {
        console.log(`%c AuthCallback: NOW REDIRECTING TO ${redirectPath}`, 'background: red; color: white; font-size: 16px');
        goTo(redirectPath, true); // Use replace=true to prevent back navigation
      }, debugRedirectDelay);
      
      return () => clearTimeout(timer);
    }
  }, [redirectPath, debugRedirectDelay, goTo]);

  // Show loading screen with appropriate message based on state
  return (
    <div>
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, padding: '10px', background: '#333', color: 'white', zIndex: 9999 }}>
        <h3>Auth Debug Info:</h3>
        <p>User: {user ? user.email : 'null'}</p>
        <p>Loading: {isLoading ? 'true' : 'false'}</p>
        <p>Redirecting to: {redirectPath || 'none yet'}</p>
        <p>Checking onboarding: {checkingOnboarding ? 'true' : 'false'}</p>
        <p>Error: {redirectError || 'none'}</p>
      </div>
      
      <LoadingScreen 
        message={
          redirectError 
            ? `${redirectError} Redirecting...` 
            : checkingOnboarding 
              ? "Checking your profile status..." 
              : "Completing authentication..."
        }
      />
    </div>
  );
};

export default AuthCallback; 