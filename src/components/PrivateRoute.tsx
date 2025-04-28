import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useProfile } from '../contexts/ProfileContext';
import LoadingScreen from './ui/LoadingScreen';
// we will use this to navigate to the correct path and willuse in next phase
//import { useNavigation } from '../hooks/useNavigation';

interface PrivateRouteProps {
  children: React.ReactNode;
  forcePath?: string;
  componentName?: string;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, forcePath, componentName = 'Unknown' }) => {
  const { user, isLoading: userLoading } = useUser();
  const { isLoading: profileLoading } = useProfile();
  const location = useLocation();

  // Show loading screen while checking auth
  if (userLoading || profileLoading) {
    return <LoadingScreen message="Checking authentication..." />;
  }

  // If no user, redirect to sign in
  if (!user) {
    console.log('PrivateRoute: No user found, redirecting to signin');
    return <Navigate to="/signin" replace />;
  }

  // If we get here, user is authenticated
  return <>{children}</>;
};

export default PrivateRoute;