# Testing Guide for Unified Profile Experience

This document outlines how to test the new unified profile experience implementation.

## Prerequisites

- Ensure you have a working development environment
- Make sure you can sign in to the application

## Testing Routes

### 1. Test New Implementation

Visit `/profile/edit` with UI controls toggled to the "onboarding" mode to test the component:
- Toggle between "Onboarding Mode" and "Profile Mode" using the switch in the top right
- Verify you can switch modes and see the appropriate UI changes

### 2. Test Main Routes

#### Onboarding Flow
1. Visit `/onboarding` (or sign up with a new account)
2. Verify you see the welcome screen with gradient background
3. Proceed through each step of the onboarding process:
   - Personal Info (shows only essential fields)
   - Roles & Skills (shows only essential roles selection)
   - Preferences (shows only essential location/environment preferences)
   - Education (shows only education level selection)
4. Complete all steps to reach the completion screen
5. Verify redirection to dashboard after completion

#### Profile Editing Flow
1. Visit `/profile/edit` with an existing account
2. Verify you see the section sidebar on the left
3. Check that sections contain both essential and additional fields:
   - Personal Info (shows basic + professional details + links)
   - Roles & Skills (shows primary roles + experience level + detailed skills)
   - Preferences (shows locations + compensation + detailed preferences)
   - Education (shows education level + institution details + honors)
4. Make changes and verify the "Save Changes" button works
5. Verify completion indicators are shown correctly

### 3. Test Special Routes

1. Visit `/force-onboarding` to test forced onboarding mode
2. Verify it uses the new unified component with onboarding styling
3. Confirm that even with completed onboarding status, you see the onboarding flow

## Potential Issues to Watch For

- Header styling not matching the mode (should be simplified in onboarding)
- Data not saving correctly between sessions
- Fields not adapting to the current mode (all fields showing in onboarding)
- Completion tracking not working (not marking steps as complete)
- Redirects happening at unexpected times

## If You Find Issues

If you encounter issues during testing:
1. Check browser console for errors
2. Verify the ThemeContext mode is set correctly for the current view
3. Check profileData context values (especially completed_steps)

Please report any issues with specific steps to reproduce them. 