// This code is setting up a User Context Provider.Meaning:
// We are saving the logged-in user's information globally (across your app).
// We are loading and refreshing profile and role data from Supabase.
// We are handling login/logout/signup/token refresh events safely even when the app is fast or interrupted.

import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

// Define types for our context
export type Profile = {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
  updated_at: string;
  role?: string;
  avatar_url?: string;
  provider?: string;
};

export type UserRole = {
  id: string;
  name: string;
  permissions?: string[];
};

type UserContextType = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  roles: UserRole[];
  isLoading: boolean;
  hasRole: (roleName: string) => boolean;
  hasPermission: (permissionName: string) => boolean;
  refreshUserData: () => Promise<void>;
};

// Create context with default values
const UserContext = createContext<UserContextType>({
  user: null,
  session: null,
  profile: null,
  roles: [],
  isLoading: true,
  hasRole: () => false,
  hasPermission: () => false,
  refreshUserData: async () => {},
});

type UserProviderProps = {
  children: ReactNode;
};

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [permissions, setPermissions] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const loadingRef = useRef(false);
  const authInitializedRef = useRef(false);
  const mountedRef = useRef(true);
  const lastAuthEventRef = useRef<string | null>(null);
  const authEventQueueRef = useRef<Array<{event: string; session: Session | null}>>([]);
  const processingAuthEventRef = useRef(false);

  // Debug function to log current state with timestamp
  const logState = (action: string) => {
    console.log(`=== State Update (${new Date().toISOString()}) ===`);
    console.log('Action:', action);
    console.log('User:', user?.email);
    console.log('Session:', session ? 'exists' : 'none');
    console.log('Profile:', profile ? 'exists' : 'none');
    console.log('Roles:', roles);
    console.log('IsLoading:', isLoading);
    console.log('LoadingRef:', loadingRef.current);
    console.log('Mounted:', mountedRef.current);
    console.log('Processing Auth Event:', processingAuthEventRef.current);
    console.log('Auth Event Queue Length:', authEventQueueRef.current.length);
    console.log('==================');
  };

  // Reset all states
  const resetStates = () => {
    if (!mountedRef.current) return;
    safeSetState(setUser, null);
    safeSetState(setSession, null);
    safeSetState(setProfile, null);
    safeSetState(setRoles, []);
    safeSetState(setPermissions, new Set());
    safeSetState(setIsLoading, false);
    loadingRef.current = false;
  };

  // Function to safely update state only if component is mounted
  const safeSetState = (setter: Function, value: any) => {
    if (mountedRef.current) {
      setter(value);
    }
  };

  // Process auth event queue
  const processNextAuthEvent = async () => {
    if (!mountedRef.current || processingAuthEventRef.current || authEventQueueRef.current.length === 0) {
      return;
    }

    processingAuthEventRef.current = true;
    const nextEvent = authEventQueueRef.current.shift();
    
    if (nextEvent) {
      console.log('🔄 Processing auth event:', {
        event: nextEvent.event,
        user: nextEvent.session?.user?.email,
        queueLength: authEventQueueRef.current.length
      });

      try {
        if (nextEvent.event === 'SIGNED_IN') {
          console.log('✅ Processing SIGNED_IN event...');
          safeSetState(setSession, nextEvent.session);
          safeSetState(setUser, nextEvent.session?.user || null);
          if (nextEvent.session?.user) {
            await loadUserData(nextEvent.session.user);
          }
        } else if (nextEvent.event === 'SIGNED_OUT' || nextEvent.event === 'USER_DELETED') {
          console.log('🚪 Processing SIGNED_OUT/USER_DELETED event...');
          resetStates();
        } else if (nextEvent.event === 'TOKEN_REFRESHED') {
          console.log('🔄 Processing TOKEN_REFRESHED event...');
          safeSetState(setSession, nextEvent.session);
        }
      } catch (error) {
        console.error('❌ Error processing auth event:', error);
      } finally {
        processingAuthEventRef.current = false;
        // Process next event if any
        if (authEventQueueRef.current.length > 0) {
          processNextAuthEvent();
        }
      }
    } else {
      processingAuthEventRef.current = false;
    }
  };

  // Function to load user data from Supabase
  const loadUserData = async (currentUser: User | null) => {
    console.log('🔄 loadUserData called for:', currentUser?.email);
    
    if (!mountedRef.current) {
      console.log('❌ Component unmounted, skipping loadUserData');
      return;
    }

    if (loadingRef.current) {
      console.log('⚠️ Already loading user data, skipping...');
      return;
    }

    const loadStartTime = Date.now();
    console.log(`🕒 Load started at: ${new Date(loadStartTime).toISOString()}`);

    try {
      loadingRef.current = true;
      safeSetState(setIsLoading, true);
      console.log('🔍 Starting user data load process...');

      if (!currentUser) {
        console.log('❌ No current user, clearing state...');
        resetStates();
        return;
      }

      // Set default role immediately to ensure we have something
      console.log('👤 Setting immediate default role...');
      safeSetState(setRoles, [{ id: 'default', name: 'user' }]);
      safeSetState(setPermissions, new Set(['basic_access']));

      // Profile fetch with timeout
      console.log('📋 Fetching profile data...');
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      const profileResult = await Promise.race([
        profilePromise,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
        )
      ]);
      
      // Check if component unmounted during fetch
      if (!mountedRef.current) {
        console.log('❌ Component unmounted during profile fetch');
        return;
      }

      // Set a safety timeout to ensure loading state is cleared
      const safetyTimeout = setTimeout(() => {
        if (mountedRef.current && loadingRef.current) {
          console.log('⚠️ Safety timeout triggered, resetting loading state');
          safeSetState(setIsLoading, false);
          loadingRef.current = false;
        }
      }, 10000); // 10 second timeout

      try {
        const { data: profileData, error: profileError } = await profileResult;

        if (profileError) {
          console.log('⚠️ Profile fetch error:', profileError);
          if (profileError.code === 'PGRST116') {
            console.log('🆕 Creating new profile...');
            // Extract name and avatar from Google auth if available
            const fullName = 
              currentUser.user_metadata?.full_name || 
              `${currentUser.user_metadata?.given_name || ''} ${currentUser.user_metadata?.family_name || ''}`.trim() || 
              '';

            const newProfile = {
              id: currentUser.id,
              email: currentUser.email,
              full_name: fullName,
              avatar_url: currentUser.user_metadata?.avatar_url || currentUser.user_metadata?.picture || '',
              provider: currentUser.app_metadata?.provider || 'email',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            
            const { error: createError } = await supabase
              .from('profiles')
              .insert([newProfile]);
              
            if (!mountedRef.current) {
              clearTimeout(safetyTimeout);
              return;
            }

            if (!createError) {
              console.log('✅ Profile created successfully');
              safeSetState(setProfile, newProfile);
            } else {
              console.error('❌ Error creating profile:', createError);
            }
          }
        } else {
          console.log('✅ Profile fetched successfully');
          safeSetState(setProfile, profileData);
        }

        // Clear safety timeout since we've completed this part
        clearTimeout(safetyTimeout);
        
        if (!mountedRef.current) return;

        try {
          // Roles fetch - in a nested try-catch to ensure errors here don't stop the flow
          console.log('🔑 Fetching user roles...');
          const { data: userRolesData, error: rolesError } = await supabase
            .from('user_roles')
            .select(`
              role:roles (
                id,
                name
              )
            `)
            .eq('user_id', currentUser.id);

          if (!mountedRef.current) {
            console.log('❌ Component unmounted during roles fetch');
            return;
          }

          console.log('Roles query result:', { userRolesData, rolesError });

          if (rolesError) {
            console.error('❌ Error fetching roles:', rolesError);
            // We already have default roles set earlier
          } else if (!userRolesData || userRolesData.length === 0) {
            console.log('⚠️ No roles found, ensuring default role...');
            await ensureUserHasDefaultRole(currentUser.id);
          } else {
            const fetchedRoles = userRolesData
              .map(ur => ur.role as UserRole)
              .filter(Boolean);
            
            console.log('📊 Fetched roles:', fetchedRoles);
            
            if (fetchedRoles.length === 0) {
              console.log('⚠️ No valid roles found, ensuring default role...');
              await ensureUserHasDefaultRole(currentUser.id);
            } else {
              safeSetState(setRoles, fetchedRoles);
              const newPermissions = new Set<string>();
              newPermissions.add('basic_access');
              if (fetchedRoles.some(role => role.name === 'admin')) {
                newPermissions.add('admin_access');
              }
              safeSetState(setPermissions, newPermissions);
              console.log('✅ Roles and permissions set successfully');
            }
          }
        } catch (roleError) {
          console.error('❌ Error handling roles:', roleError);
          // We already have default roles set earlier
        }
      } catch (error) {
        console.error('❌ Error processing profile data:', error);
        clearTimeout(safetyTimeout);
      }
    } catch (error) {
      console.error('❌ Error in loadUserData:', error);
    } finally {
      if (mountedRef.current) {
        const loadEndTime = Date.now();
        console.log(`✅ Load completed in ${loadEndTime - loadStartTime}ms`);
        safeSetState(setIsLoading, false);
        loadingRef.current = false;
        logState('loadUserData complete');
      }
    }
  };

  // Helper function to ensure user has the default role
  const ensureUserHasDefaultRole = async (userId: string) => {
    console.log('🔄 Ensuring default role for user:', userId);
    
    if (!mountedRef.current) {
      console.log('❌ Component unmounted, skipping ensureUserHasDefaultRole');
      return;
    }
    
    try {
      const { data: roleData, error: roleError } = await supabase
        .from('roles')
        .select('id')
        .eq('name', 'user')
        .single();

      if (!mountedRef.current) return;
      
      console.log('Default role query result:', { roleData, roleError });

      if (roleError || !roleData) {
        console.error('❌ Error fetching default role:', roleError);
        safeSetState(setRoles, [{ id: 'default', name: 'user' }]);
        safeSetState(setPermissions, new Set(['basic_access']));
        return;
      }

      console.log('🔄 Assigning default role...');
      const { error: assignError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role_id: roleData.id
        })
        .select()
        .single();

      if (!mountedRef.current) return;

      if (assignError) {
        if (assignError.message.includes('unique constraint')) {
          console.log('ℹ️ User already has default role');
        } else {
          console.error('❌ Error assigning default role:', assignError);
        }
      } else {
        console.log('✅ Default role assigned successfully');
      }

      safeSetState(setRoles, [{ id: roleData.id, name: 'user' }]);
      safeSetState(setPermissions, new Set(['basic_access']));
    } catch (error) {
      console.error('❌ Error in ensureUserHasDefaultRole:', error);
      if (mountedRef.current) {
        safeSetState(setRoles, [{ id: 'default', name: 'user' }]);
        safeSetState(setPermissions, new Set(['basic_access']));
      }
    }
  };

  // Function to refresh user data (can be called after profile updates)
  const refreshUserData = async () => {
    if (loadingRef.current) {
      console.log('⚠️ Already loading, skipping refresh');
      return;
    }
    
    safeSetState(setIsLoading, true);
    await loadUserData(user);
  };

  // Set up initial auth state and listeners
  useEffect(() => {
    mountedRef.current = true;
    console.log('🔄 Initializing auth state...');

    const initializeAuth = async () => {
      if (authInitializedRef.current) {
        console.log('⚠️ Auth already initialized, skipping...');
        return;
      }

      try {
        console.log('🔍 Getting initial session...');
        // First, immediately reset loading state if there's no session
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (!mountedRef.current) {
          console.log('❌ Component unmounted, abandoning initialization');
          return;
        }

        // Set immediate state to avoid flicker
        safeSetState(setSession, initialSession);
        safeSetState(setUser, initialSession?.user || null);
        
        // Set default fallback values immediately for loading states
        if (!initialSession) {
          console.log('ℹ️ No initial session, clearing state immediately');
          safeSetState(setIsLoading, false);
        } else {
          console.log('✅ Initial session found, will load user data');
        }

        // Queue initial session as an auth event (for full data loading)
        if (initialSession?.user) {
          console.log('✅ Queueing initial session for data loading');
          authEventQueueRef.current.push({
            event: 'SIGNED_IN',
            session: initialSession
          });
          processNextAuthEvent();
        } else {
          resetStates();
        }

        console.log('🔄 Setting up auth state change listener...');
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, newSession) => {
            if (!mountedRef.current) {
              console.log('❌ Component unmounted, ignoring auth change');
              return;
            }

            console.log('🔔 Auth state changed:', {
              event,
              user: newSession?.user?.email,
              timestamp: new Date().toISOString(),
              currentlyProcessing: processingAuthEventRef.current,
              queueLength: authEventQueueRef.current.length
            });

            // Handle immediate state updates for better UX
            if (event === 'SIGNED_IN') {
              // Update state right away for faster UI response
              safeSetState(setSession, newSession);
              safeSetState(setUser, newSession?.user || null);
            } else if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
              // Clear state immediately
              resetStates();
            }

            // Queue the event for full data processing
            authEventQueueRef.current.push({ event, session: newSession });
            processNextAuthEvent();
          }
        );

        authInitializedRef.current = true;
        return () => {
          console.log('🧹 Cleaning up auth listener...');
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('❌ Error in initializeAuth:', error);
        if (mountedRef.current) {
          resetStates();
        }
      }
    };

    initializeAuth();

    return () => {
      console.log('🧹 Component unmounting, cleaning up...');
      mountedRef.current = false;
      loadingRef.current = false;
      authInitializedRef.current = false;
      processingAuthEventRef.current = false;
      authEventQueueRef.current = [];
    };
  }, []);

  // Helper functions for permissions
  const hasRole = (roleName: string): boolean => {
    return roles.some(role => role.name === roleName);
  };

  const hasPermission = (permissionName: string): boolean => {
    return permissions.has(permissionName);
  };

  // Create context value
  const value: UserContextType = {
    user,
    session,
    profile,
    roles,
    isLoading,
    hasRole,
    hasPermission,
    refreshUserData,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

// Hook for using the context
export const useUser = () => useContext(UserContext);

// Auth protection component
export const RequireAuth: React.FC<{children: ReactNode}> = ({ children }) => {
  const { user, isLoading } = useUser();
  const navigate = useNavigate();
  
  console.log('RequireAuth render:', { user: !!user, isLoading });

  useEffect(() => {
    console.log('RequireAuth effect:', { user: !!user, isLoading });
    
    // Only redirect if we're not loading and user is not authenticated
    if (!isLoading && !user) {
      console.log('RequireAuth: No user and not loading, redirecting to signin');
      navigate('/signin');
    }
  }, [user, isLoading, navigate]);

  // Return children immediately if user is authenticated, regardless of loading state
  if (user) {
    console.log('RequireAuth: User authenticated, showing content');
    return <>{children}</>;
  }
  
  // Show loading spinner only if we're still loading and don't have a user yet
  if (isLoading) {
    console.log('RequireAuth: Still loading, showing spinner');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // If we're not loading and have no user, render nothing (redirect effect will handle navigation)
  console.log('RequireAuth: No user and not loading, returning null');
  return null;
};

// Role protection component
export const RequireRole: React.FC<{role: string; children: ReactNode}> = ({ role, children }) => {
  const { hasRole, isLoading } = useUser();

  if (isLoading) return null;
  if (!hasRole(role)) return null;

  return <>{children}</>;
};

// Permission protection component
export const RequirePermission: React.FC<{permission: string; children: ReactNode}> = 
  ({ permission, children }) => {
    const { hasPermission, isLoading } = useUser();

    if (isLoading) return null;
    if (!hasPermission(permission)) return null;

    return <>{children}</>;
  };