# Unified Profile Component Implementation Steps

Follow these steps to implement the unified profile/onboarding experience:

## 1. Update Database Tables

Run the `alter_existing_tables.sql` script in your Supabase SQL Editor to:
- Add new columns to existing profiles table
- Create user_preferences and user_onboarding tables if they don't exist
- Update RLS policies (first dropping existing ones to avoid conflicts)

This script will run cleanly even if you've already run parts of the database schema before.

## 2. Migrate Existing Data

Run the `migrate_existing_users.sql` script to:
- Set up default preferences for existing users
- Mark onboarding as complete for existing users
- (Optionally) Insert a sample record for demonstration purposes

## 3. Add the Required Components

Make sure these components are added to your codebase:
- `src/contexts/ProfileContext.tsx`
- `src/pages/ProfileUnified.tsx`

## 4. Update App.tsx

Update your App.tsx to:
- Import the ProfileProvider and ProfileUnified components
- Add the ProfileProvider around your routes
- Add the /profile-setup route
- Redirect /profile and /onboarding to /profile-setup

## 5. Update Navigation

Update your Header component to navigate to /profile-setup instead of /profile.

## 6. Update SignUp Flow

Make sure new users are directed to /profile-setup after signup instead of /onboarding.

## Testing the Implementation

1. **Test with Existing Users:**
   - Sign in as an existing user
   - Visit /profile-setup
   - You should see the edit mode with your existing profile data
   - Toggle to onboarding mode to verify it works

2. **Test with New Users:**
   - Create a new user account
   - Verify you're directed to /profile-setup
   - Complete the onboarding process
   - Verify data is saved correctly

3. **Data Verification:**
   - Check your Supabase tables to verify data is being stored correctly
   - Confirm that switching between onboarding and edit modes preserves data

## Troubleshooting

### Common Issues:

1. **Policy Already Exists Error:**
   - This means you're trying to create an RLS policy that already exists
   - Use the DROP POLICY statements in the script first

2. **Table Does Not Exist:**
   - If you see "table does not exist" errors, make sure you're running scripts in the correct order
   - The profiles table must exist before creating user_preferences and user_onboarding

3. **Missing Profile Data:**
   - If profile data isn't showing up, check your browser console for errors in the data loading
   - Verify the data exists in your Supabase tables

4. **Component Errors:**
   - If you see React errors, check for missing imports or props
   - Make sure all the tiered components (TieredPersonalInfo, TieredUserPreferences, etc.) are available 