# Data Fetching Patterns

This document outlines the current data fetching patterns used in the RightBoss Candidate Portal application and provides recommendations for standardization and improvement.

## Executive Summary

Our analysis of the RightBoss Candidate Portal codebase reveals inconsistent data fetching patterns with direct Supabase calls embedded within components. This creates challenges for testing, reusability, and maintenance. We recommend implementing a service layer pattern with custom hooks to standardize data access across the application.

## Current Data Fetching Patterns

After analyzing the codebase, we've identified several patterns for interacting with the Supabase backend:

### Pattern 1: Direct Component API Calls

This is the most common pattern found in the application, used in nearly all components that require data.

```jsx
// Example from a component
import { supabase } from '../lib/supabase';
import { useState, useEffect } from 'react';

function ProfileComponent() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  // Component rendering with loading/error states
}
```

**Actual Components Using This Pattern:**
- `Dashboard.tsx`: Fetches user jobs and recommendations
- `UnifiedProfileExperience.tsx`: Fetches profile data
- `JobDetails.tsx`: Fetches job details and related company info

**Issues with this pattern:**
- Duplicate data fetching logic across components
- Inconsistent error and loading state handling
- No data caching or synchronization between components
- Testing is difficult due to direct Supabase dependency

### Pattern 2: Inline Event Handlers

This pattern is common in form submission handlers throughout the application.

```jsx
// Example from form submission
const handleSubmit = async (e) => {
  e.preventDefault();
  setSubmitting(true);
  
  try {
    const { error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: user.id,
        preferences: formData
      });
      
    if (error) throw error;
    setSuccess(true);
  } catch (error) {
    setError(error.message);
  } finally {
    setSubmitting(false);
  }
};
```

**Actual Components Using This Pattern:**
- `SignUp.tsx`: User registration form
- `TieredPersonalInfo.tsx`: Profile information updates
- `TieredUserPreferences.tsx`: User preference submissions

**Issues with this pattern:**
- Business logic mixed with UI logic
- Duplicate error handling across multiple handlers
- No standardized success/error feedback mechanism

### Pattern 3: Authentication Handling

Authentication logic is spread across authentication-related components.

```jsx
// Example from authentication components
const handleLogin = async () => {
  try {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    navigate('/dashboard');
  } catch (error) {
    setError(error.message);
  } finally {
    setLoading(false);
  }
};
```

**Actual Components Using This Pattern:**
- `SignIn.tsx`: Login functionality
- `SignUp.tsx`: Registration functionality
- `AuthCallback.tsx`: Auth redirect handling
- `PrivateRoute.tsx`: Session verification

**Issues with this pattern:**
- Authentication logic spread across components
- No central management of auth state
- Repeated navigation logic after auth actions

### Pattern 4: Conditional Data Fetching

Some components implement conditional data fetching based on props or state.

```jsx
// Example of conditional fetching
useEffect(() => {
  if (!userId) return;
  
  async function fetchUserData() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) throw error;
      setUserData(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }
  
  fetchUserData();
}, [userId]);
```

**Actual Components Using This Pattern:**
- `UnifiedProfileExperience.tsx`: Conditional based on mode (onboarding vs edit)
- `JobDetails.tsx`: Conditional fetching based on job ID

**Issues with this pattern:**
- Complex dependency arrays can lead to bugs
- No standardized approach to conditional fetching
- Potential for race conditions with changing dependencies

## Data Dependencies Between Components

Our analysis revealed several key data dependencies that require standardization:

1. **User Profile Data**
   - Used in: Dashboard, UnifiedProfileExperience, Header
   - Current issue: Each component fetches profile independently

2. **Job Listings**
   - Used in: Dashboard, JobDetails
   - Current issue: No shared data between listing and detail view

3. **Authentication State**
   - Used in: PrivateRoute, multiple pages
   - Current issue: Auth verification repeated in multiple components

## Recommended Patterns

Based on our analysis, we recommend implementing the following standardized patterns:

### 1. Custom Data Hooks Pattern

```jsx
// hooks/useProfile.js
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useProfile(userId) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;
    
    async function fetchProfile() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [userId]);

  const updateProfile = async (updates) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      setProfile(data);
      return { success: true };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    profile,
    loading,
    error,
    updateProfile
  };
}

// Usage in component
function ProfileComponent() {
  const { profile, loading, error, updateProfile } = useProfile(userId);
  
  // Component with clean data access
}
```

**Benefits:**
- Encapsulates data fetching logic
- Provides consistent loading/error states
- Reusable across components
- Easier to test with mock implementations

### 2. Service Layer Pattern

```jsx
// services/profileService.js
import { supabase } from '../lib/supabase';

export const ProfileService = {
  async getProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return { data };
    } catch (error) {
      return { error: error.message };
    }
  },
  
  async updateProfile(userId, updates) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return { data };
    } catch (error) {
      return { error: error.message };
    }
  }
};

// Usage with hooks
function useProfile(userId) {
  const [state, setState] = useState({ 
    data: null, 
    loading: true, 
    error: null 
  });
  
  useEffect(() => {
    async function loadProfile() {
      setState(s => ({ ...s, loading: true }));
      const { data, error } = await ProfileService.getProfile(userId);
      setState({ 
        data, 
        loading: false, 
        error 
      });
    }
    
    loadProfile();
  }, [userId]);
  
  return state;
}
```

**Benefits:**
- Clear separation of concerns
- Can be used with or without hooks
- Centralized error handling
- Easier to mock for testing

### 3. React Query Implementation

For more advanced data management, we recommend implementing React Query:

```jsx
// queries/profileQueries.js
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { ProfileService } from '../services/profileService';

export function useProfileQuery(userId) {
  return useQuery(
    ['profile', userId],
    () => ProfileService.getProfile(userId),
    {
      enabled: !!userId,
      select: (response) => response.data
    }
  );
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ userId, updates }) => ProfileService.updateProfile(userId, updates),
    {
      onSuccess: (data, { userId }) => {
        queryClient.invalidateQueries(['profile', userId]);
      }
    }
  );
}

// Usage in component
function ProfileComponent() {
  const { data: profile, isLoading, error } = useProfileQuery(userId);
  const updateMutation = useUpdateProfileMutation();
  
  const handleUpdate = (updates) => {
    updateMutation.mutate({ userId, updates });
  };
  
  // Component with advanced data management
}
```

**Benefits:**
- Automatic caching and refetching
- Dependent queries support
- Optimistic updates
- Background refetching
- Query invalidation
- Pagination support

## Required Services for Implementation

Based on our component analysis, we need to implement the following services:

1. **AuthService**
   - `signIn(email, password)`
   - `signUp(email, password, userData)`
   - `signOut()`
   - `getSession()`
   - `resetPassword(email)`

2. **ProfileService**
   - `getProfile(userId)`
   - `updateProfile(userId, data)`
   - `getPreferences(userId)`
   - `updatePreferences(userId, preferences)`

3. **JobsService**
   - `getJobs(filters)`
   - `getJobById(jobId)`
   - `applyToJob(jobId, userId, application)`
   - `getRecommendedJobs(userId)`

4. **OnboardingService**
   - `getOnboardingState(userId)`
   - `updateOnboardingStep(userId, step, data)`
   - `completeOnboarding(userId)`

## Implementation Plan

We recommend a phased approach to implementing these patterns:

### Phase 1: Service Layer Implementation
1. Create base service module with error handling utilities
2. Implement AuthService (highest priority)
3. Implement ProfileService
4. Implement JobsService
5. Implement OnboardingService
6. Add unit tests for services

### Phase 2: Custom Hooks Implementation
1. Create base hook patterns for consistent state management
2. Implement authentication hooks
3. Implement profile data hooks
4. Implement job data hooks
5. Update components to use hooks instead of direct API calls

### Phase 3: React Query Integration (Optional)
1. Set up React Query provider in the application
2. Convert basic hooks to React Query hooks
3. Implement caching strategies
4. Add optimistic updates for forms
5. Implement dependent queries for related data

## Migration Strategy

To minimize disruption during implementation, we recommend:

1. **Parallel Implementation**: Create new services and hooks without modifying existing components
2. **Component-by-Component Migration**: Start with the simplest components and gradually migrate
3. **Shared State Last**: Address global state management after individual components are migrated
4. **Testing at Each Step**: Ensure each migrated component works correctly before moving to the next

## Best Practices for Implementation

1. **Error Handling**
   - Always handle API errors consistently
   - Provide user-friendly error messages
   - Log detailed errors for debugging

2. **Loading States**
   - Show appropriate loading indicators
   - Avoid UI jumps during data loading
   - Consider skeleton loading states for better UX

3. **Data Transformation**
   - Transform API responses to component-friendly formats
   - Handle null/undefined values gracefully
   - Format dates and other specialized data types

4. **Testing**
   - Create mock services for testing
   - Test hooks with React Testing Library
   - Use MSW (Mock Service Worker) for API mocking

## Success Criteria

Implementation will be considered successful when:

1. All components use standardized data fetching patterns
2. No direct Supabase API calls exist in components
3. Testing coverage for data fetching is at least 80%
4. Data dependencies are clearly documented
5. Component code is simplified by removing data fetching logic

By implementing these patterns, we'll significantly improve the maintainability, testability, and performance of the application's data management. 