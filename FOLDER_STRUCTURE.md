# Project Folder Structure

## Root Directory
```
project/
├── .bolt/                  # Bolt configuration files
├── dist/                   # Production build output
├── node_modules/          # Dependencies
├── src/                   # Source code
├── supabase/             # Supabase configuration and migrations
├── .env                   # Environment variables
├── .gitignore            # Git ignore rules
├── .eslint.config.js     # ESLint configuration
├── index.html            # Main HTML file
├── package.json          # Project dependencies and scripts
├── package-lock.json     # Lock file for dependencies
├── postcss.config.js     # PostCSS configuration
├── tailwind.config.js    # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration
├── tsconfig.app.json     # App-specific TypeScript configuration
├── tsconfig.node.json    # Node-specific TypeScript configuration
├── vite.config.ts        # Vite configuration
└── Various SQL files     # Database migration and setup scripts
```

## Source Code (`src/`)
```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Base UI components
│   ├── layout/          # Layout components
│   ├── features/        # Feature-specific components
│   └── profile/         # Profile-related components
│       ├── hooks/       # Profile-specific hooks
│       ├── sections/    # Profile section components
│       └── ui/          # Profile UI components
├── config/              # Application configuration
├── contexts/            # React context providers
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions and libraries
├── pages/               # Page components
├── types/               # TypeScript type definitions
├── App.tsx              # Main application component
├── index.css            # Global styles
├── main.tsx             # Application entry point
└── vite-env.d.ts        # Vite environment type definitions
```

## Documentation Files
```
├── README.md                    # Project overview and setup instructions
├── IMPLEMENTATION_PROGRESS.md   # Track implementation progress
├── COMPONENT_USAGE_MATRIX.md    # Component usage documentation
├── FOLDER_STRUCTURE.md          # This file
├── IMPLEMENTATION_PLAN.md       # Implementation strategy
├── STATE_MANAGEMENT_ANALYSIS.md # State management documentation
├── TESTING_SETUP.md            # Testing configuration
├── TESTING_STRATEGY.md         # Testing approach
├── COMPONENT_CONSOLIDATION.md  # Component organization
├── DATA_PATTERNS.md           # Data structure patterns
├── test_implementation.md      # Test implementation details
└── final_implementation_steps.md # Final implementation steps
```

## Database Scripts
```
├── debug_supabase.sql        # Debugging scripts for Supabase
├── fix_profiles.sql          # Profile table fixes
├── advanced_fix.sql          # Advanced database fixes
├── modular_setup.sql         # Modular database setup
├── setup_tables_updated.sql  # Updated table setup
├── migrate_existing_users.sql # User migration scripts
├── alter_existing_tables.sql # Table alteration scripts
├── database_schema.sql       # Database schema definition
└── add_profile_columns.sql   # Profile column additions
```

## Key Features
- **Modular Structure**: Clear separation of concerns with dedicated directories for components, pages, hooks, and utilities
- **Type Safety**: Comprehensive TypeScript configuration with separate configs for app and node environments
- **Styling**: Tailwind CSS configuration with PostCSS support
- **Build Tools**: Vite-based build system with optimized configuration
- **Database**: Supabase integration with comprehensive migration scripts
- **Testing**: Dedicated testing setup and strategy documentation
- **Documentation**: Extensive documentation covering implementation, testing, and component usage

## Root Directory

- **package.json**: Defines project dependencies and scripts
- **vite.config.ts**: Configuration for the Vite build tool
- **tsconfig.json**: TypeScript compiler configuration
- **tailwind.config.js**: TailwindCSS configuration
- **database_schema.sql**: SQL schema for the Supabase database
- **.env**: Environment variables for Supabase connection

## Source Code (`src/`)

### Core Files

- **main.tsx**: Application entry point that renders the App component
- **App.tsx**: Main application component with routing configuration
- **index.css**: Global CSS styles including TailwindCSS imports
- **vite-env.d.ts**: TypeScript declarations for Vite environment

### Components (`components/`)

Contains reusable UI components organized by functionality.

#### Base UI Components (`components/ui/`)

Generic UI components used throughout the application:

- **Avatar.tsx**: User avatar display component
- **Button.tsx**: Customizable button component
- **Card.tsx**: Card container component
- **Input.tsx**: Form input component
- **LoadingScreen.tsx**: Loading state component
- **ProgressBar.tsx**: Progress visualization component
- **DebugController.tsx**: Debugging tools for development
- **EnhancedProgressBar.tsx**: Advanced progress visualization

#### Layout Components (`components/layout/`)

Components that define the application layout:

- **Header.tsx**: Application header component

#### Feature Components (`components/features/`)

Components tied to specific features:

- **ChatInterface.tsx**: User chat functionality
- **CompanyCard.tsx**: Company information display
- **JobMatchCard.tsx**: Job matching card component
- **OnboardingSteps.tsx**: Onboarding flow steps
- **SkillRadarChart.tsx**: Visualization for user skills

#### Auth and Route Components

Located directly in the components directory:

- **AuthCallback.tsx**: Handles authentication callback from Supabase
- **PrivateRoute.tsx**: Route wrapper for authenticated routes
- **ProfileRedirect.tsx**: Handles redirects based on profile status

#### Profile Components (`components/profile/`)

Components specific to user profiles:

##### Profile Hooks (`components/profile/hooks/`)

Custom hooks for profile functionality:

- **useInterview.ts**: Logic for interview functionality
- **useProfileNavigation.ts**: Navigation between profile sections
- **useProfileSave.ts**: Saving profile information
- **useRoleSelection.ts**: Role selection functionality

##### Profile Sections (`components/profile/sections/`)

Components for different profile sections:

- **TieredEducation.tsx**: Education information section
- **TieredPersonalInfo.tsx**: Personal information section
- **TieredProfileSection.tsx**: Base component for profile sections
- **TieredRoleSelection.tsx**: Job role selection section
- **TieredUserPreferences.tsx**: User preferences section
- **WelcomeSection.tsx**: Profile welcome section

##### Profile UI Components (`components/profile/ui/`)

UI components specific to profiles:

- **ProfileHeader.tsx**: Profile page header
- **SaveFeedback.tsx**: Feedback for save operations
- **SectionFooter.tsx**: Footer for profile sections
- **SectionWrapper.tsx**: Wrapper for profile sections
- **ThemedCard.tsx**: Themed card component for profiles

### Contexts (`contexts/`)

React context providers for state management:

- **UserContext.tsx**: Authentication and user state management
- **ProfileContext.tsx**: User profile data management
- **ThemeContext.tsx**: Theme management for the application

### Configuration (`config/`)

Application configuration files:

- **interviewData.ts**: Data for interview functionality
- **onboarding.ts**: Onboarding flow configuration
- **profileSections.ts**: Profile sections configuration
- **roles.ts**: Job roles configuration

### Pages (`pages/`)

Main page components for different routes:

- **Home.tsx**: Landing page
- **SignIn.tsx**: Sign in page
- **SignUp.tsx**: Sign up page
- **Dashboard.tsx**: Main dashboard after login
- **JobDetails.tsx**: Job listing details page
- **UnifiedProfileExperience.tsx**: Combined profile editing/onboarding
- **ProfileUnified.tsx**: Unified profile page component

### Types (`types/`)

TypeScript type definitions:

- **database.ts**: Types for database models
- **index.ts**: Common type definitions

## SQL Files

Several SQL files in the root directory define the database schema and migrations:

- **database_schema.sql**: Main database schema definition
- **setup_tables_updated.sql**: Updated table setup
- **alter_existing_tables.sql**: Table alteration scripts
- **add_profile_columns.sql**: Adding columns to profiles table

## Documentation Files

- **README.md**: Project overview and getting started guide
- **FOLDER_STRUCTURE.md**: This document detailing the folder structure

## Build Outputs

- **dist/**: Build output directory (created when running `npm run build`)

## Development Tools

- **.bolt/**: Contains Bolt-specific configuration
- **node_modules/**: Node.js dependencies 