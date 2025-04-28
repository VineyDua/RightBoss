# Component Consolidation Plan

This document outlines the strategy for consolidating redundant components in the RightBoss Candidate Portal application. Based on our analysis, approximately 48% of TypeScript files are currently unused, and many components have overlapping functionality.

## Component Redundancy Analysis

| Component Group | Redundant Files | Issues | 
|-----------------|-----------------|--------|
| **Profile UI** | `ThemedCard.tsx`, `Card.tsx`, `SectionWrapper.tsx` | Multiple wrapper components with similar styling purposes |
| **Progress Components** | `ProgressBar.tsx`, `EnhancedProgressBar.tsx` | Duplicate progress visualization components |
| **Role Selection** | `RoleSelector.tsx`, `TieredRoleSelection.tsx` | Similar functionality for role selection |
| **Onboarding** | `OnboardingSteps.tsx`, `EnhancedOnboardingSteps.tsx` | Parallel implementation of onboarding UI |
| **Profile Components** | `UnifiedProfileExperience.tsx`, `ProfileUnified.tsx` | Potentially duplicate profile containers |
| **Navigation** | `useProfileNavigation.ts`, `ProfileSectionNav.tsx` | Fragmented navigation logic |

## Consolidation Strategy

### 1. UI Components Consolidation

#### Card Components

**Current:**
- `Card.tsx`: General card component
- `ThemedCard.tsx`: Card with theme variations
- `SectionWrapper.tsx`: Wrapper for profile sections

**Consolidation Plan:**
1. Create a single `Card.tsx` component with theme support
2. Use composition for specialized variants
3. Add props for section-specific styling

```jsx
// Example consolidated Card component
import React from 'react';
import { cn } from '../utils/classnames';

export type CardVariant = 'default' | 'profile' | 'job';
export type CardSize = 'sm' | 'md' | 'lg';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  size?: CardSize;
  className?: string;
  footer?: React.ReactNode;
  header?: React.ReactNode;
}

export function Card({
  children,
  variant = 'default',
  size = 'md',
  className,
  footer,
  header
}: CardProps) {
  return (
    <div 
      className={cn(
        'rounded-lg shadow', 
        {
          'bg-white': variant === 'default',
          'bg-blue-50': variant === 'profile',
          'bg-gray-50': variant === 'job',
          'p-4': size === 'sm',
          'p-6': size === 'md',
          'p-8': size === 'lg',
        },
        className
      )}
    >
      {header && (
        <div className="mb-4 border-b pb-4">
          {header}
        </div>
      )}
      
      <div className="card-content">
        {children}
      </div>
      
      {footer && (
        <div className="mt-4 border-t pt-4">
          {footer}
        </div>
      )}
    </div>
  );
}
```

#### Progress Components

**Current:**
- `ProgressBar.tsx`: Basic progress bar
- `EnhancedProgressBar.tsx`: Advanced progress visualization

**Consolidation Plan:**
1. Create a unified `ProgressBar.tsx` with optional "enhanced" mode
2. Ensure backward compatibility with current usage
3. Add props for customization

```jsx
// Example consolidated ProgressBar component
interface ProgressBarProps {
  value: number;
  max?: number;
  enhanced?: boolean;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'success' | 'warning';
}

export function ProgressBar({
  value,
  max = 100,
  enhanced = false,
  showLabel = true,
  size = 'md',
  color = 'primary'
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  return (
    <div className="progress-container">
      {showLabel && (
        <div className="flex justify-between mb-1">
          <span>{enhanced ? `${value} of ${max} complete` : `${Math.round(percentage)}%`}</span>
        </div>
      )}
      
      <div 
        className={cn(
          'bg-gray-200 rounded-full',
          {
            'h-1': size === 'sm',
            'h-2': size === 'md',
            'h-4': size === 'lg'
          }
        )}
      >
        <div
          className={cn(
            'rounded-full transition-all duration-300',
            {
              'bg-blue-500': color === 'primary',
              'bg-green-500': color === 'success',
              'bg-yellow-500': color === 'warning',
              'h-1': size === 'sm',
              'h-2': size === 'md',
              'h-4': size === 'lg'
            }
          )}
          style={{ width: `${percentage}%` }}
        >
          {enhanced && size === 'lg' && (
            <div className="h-full flex items-center justify-end pr-2">
              <span className="text-xs text-white font-bold">
                {Math.round(percentage)}%
              </span>
            </div>
          )}
        </div>
      </div>
      
      {enhanced && (
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="text-center">
              <div className="w-px h-2 bg-gray-300 mx-auto" />
              <div>{i * 25}%</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### 2. Feature Components Consolidation

#### Role Selection Components

**Current:**
- `RoleSelector.tsx`: Basic role selection
- `TieredRoleSelection.tsx`: Tiered approach to role selection

**Consolidation Plan:**
1. Keep `TieredRoleSelection.tsx` as the primary component
2. Add compatibility mode for `RoleSelector.tsx` usage
3. Update imports across the application

#### Onboarding Components

**Current:**
- `OnboardingSteps.tsx`: Standard onboarding steps
- `EnhancedOnboardingSteps.tsx`: Advanced onboarding experience

**Consolidation Plan:**
1. Identify the most complete implementation
2. Merge unique features from both components
3. Provide backward compatibility through props

#### Profile Experience Components

**Current:**
- `UnifiedProfileExperience.tsx`: Combined profile/onboarding
- `ProfileUnified.tsx`: Possible duplicate/earlier version

**Consolidation Plan:**
1. Conduct detailed comparison of both components
2. Keep `UnifiedProfileExperience.tsx` if it's more complete
3. Extract any unique functionality from `ProfileUnified.tsx`
4. Update routing and imports accordingly

### 3. Hook Consolidation

#### Navigation Hooks

**Current:**
- `useProfileNavigation.ts`: Navigation between profile sections
- Navigation logic in various components

**Consolidation Plan:**
1. Create a unified navigation hook
2. Centralize routing logic
3. Provide consistent navigation patterns

```jsx
// Example consolidated navigation hook
import { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export function useAppNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const goToProfile = useCallback(() => {
    navigate('/profile');
  }, [navigate]);
  
  const goToProfileSection = useCallback((section) => {
    navigate(`/profile/${section}`);
  }, [navigate]);
  
  const goToDashboard = useCallback(() => {
    navigate('/dashboard');
  }, [navigate]);
  
  const goToOnboarding = useCallback((step = 1) => {
    navigate(`/onboarding?step=${step}`);
  }, [navigate]);
  
  const goToNextProfileSection = useCallback(() => {
    // Logic to determine next section based on current URL
    const currentSection = location.pathname.split('/').pop();
    const sections = ['personal', 'education', 'experience', 'preferences'];
    const currentIndex = sections.indexOf(currentSection);
    const nextSection = sections[currentIndex + 1] || 'summary';
    
    goToProfileSection(nextSection);
  }, [location.pathname, goToProfileSection]);
  
  return {
    goToProfile,
    goToProfileSection,
    goToDashboard,
    goToOnboarding,
    goToNextProfileSection
  };
}
```

## Implementation Strategy

### Phase 1: Preparation

1. **Identify Active Usage**
   - Document where each component is currently being used
   - Identify import paths that need updating

2. **Create Component Tests**
   - Add basic tests for components before consolidation
   - Ensure we can validate functionality after changes

3. **Create Backward Compatibility Plan**
   - Determine how to maintain existing API contracts
   - Plan for deprecation warnings if needed

### Phase 2: Core UI Components

1. **Consolidate Card Components**
   - Implement unified Card component
   - Update imports and usage
   - Test rendering in various contexts

2. **Consolidate Progress Components**
   - Implement unified ProgressBar component
   - Update imports and usage
   - Validate visual appearance

### Phase 3: Feature Components

1. **Role Selection Consolidation**
   - Combine role selection components
   - Test with various data scenarios
   - Update related components

2. **Onboarding Consolidation**
   - Merge onboarding step components
   - Test full onboarding flow
   - Ensure all variations still work

3. **Profile Components Consolidation**
   - Finalize unified profile experience
   - Test with various user states
   - Ensure smooth navigation

### Phase 4: Hook Consolidation

1. **Navigation Hook Implementation**
   - Create unified navigation hooks
   - Update components to use new hooks
   - Test navigation flows

2. **Data Hooks Implementation**
   - Align with the data fetching strategy
   - Implement reusable data hooks
   - Replace direct Supabase calls

## Risk Mitigation

1. **Staged Rollout**
   - Consolidate one component group at a time
   - Test thoroughly after each consolidation
   - Be prepared to rollback changes if issues arise

2. **Backward Compatibility**
   - Maintain original prop interfaces where possible
   - Add deprecation warnings for future removal
   - Document migration paths for developers

3. **Feature Flags**
   - Consider using feature flags for larger consolidations
   - Allow toggling between old and new implementations
   - Ensure safe deployment to production

## Success Metrics

1. **Code Reduction**
   - Reduce total TypeScript files by 25%+
   - Decrease duplicate code by 40%+

2. **Performance**
   - Maintain or improve bundle size
   - No regression in render performance

3. **Developer Experience**
   - Clearer component hierarchy
   - Better documentation
   - More consistent patterns

## Timeline

| Phase | Components | Estimated Time | Dependencies |
|-------|------------|----------------|--------------|
| Preparation | All | 1 week | None |
| Core UI | Card, Progress | 1-2 weeks | Preparation |
| Feature Components | Role, Onboarding, Profile | 2-3 weeks | Core UI |
| Hooks | Navigation, Data | 1-2 weeks | Feature Components |

## Conclusion

By systematically consolidating redundant components, we will significantly reduce technical debt while improving the overall architecture of the application. This process will result in a more maintainable codebase, better performance, and an improved developer experience. 