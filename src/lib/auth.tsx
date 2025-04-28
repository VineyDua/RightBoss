import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from './supabase';
import type { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const handleAuthError = async (error: any) => {
    console.error('Auth error:', error);
    
    // Check specifically for refresh token errors
    if (error.message?.includes('refresh_token_not_found') || 
        error.error?.message?.includes('refresh_token_not_found')) {
      await signOut();
      return;
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          await handleAuthError(error);
          return;
        }

        if (mounted) {
          setUser(session?.user ?? null);
          setLoading(false);
        }
      } catch (error) {
        await handleAuthError(error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'TOKEN_REFRESHED') {
        if (mounted) {
          setUser(session?.user ?? null);
        }
      } else if (event === 'SIGNED_OUT') {
        if (mounted) {
          setUser(null);
          navigate('/signin', { replace: true });
        }
      } else {
        if (mounted) {
          setUser(session?.user ?? null);
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  // Redirect effect
  useEffect(() => {
    if (!loading) {
      if (user && ['/signin', '/signup', '/'].includes(location.pathname)) {
        navigate('/dashboard', { replace: true });
      } else if (!user && !['/', '/signin', '/signup'].includes(location.pathname)) {
        navigate('/signin', { replace: true });
      }
    }
  }, [user, loading, navigate, location.pathname]);

  const signOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      setUser(null);
      navigate('/signin', { replace: true });
    } catch (error) {
      console.error('Error signing out:', error);
      // Even if sign out fails, we want to clear the local state
      setUser(null);
      navigate('/signin', { replace: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};