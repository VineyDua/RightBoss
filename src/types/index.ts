export interface User {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
}

export interface Company {
  id: string;
  name: string;
  logo: string;
  location: string;
  description: string;
}

export interface JobMatch {
  id: string;
  company: Company;
  role: string;
  matchPercentage: number;
  status: 'pending' | 'active' | 'declined' | 'accepted';
}

export interface Skill {
  name: string;
  level: number; // 0-100
}

export interface SkillAssessment {
  skills: Skill[];
  strengths: string[];
  areasOfImprovement: string[];
}

export interface UserPreferences {
  location: string[];
  remotePreference: 'remote' | 'hybrid' | 'onsite' | 'flexible';
  salaryExpectation: {
    min: number;
    max: number;
  };
  roles: string[];
}

export interface InterviewMessage {
  id: string;
  sender: 'ai' | 'user';
  content: string;
  timestamp: Date;
}

export interface Interview {
  id: string;
  status: 'scheduled' | 'in_progress' | 'completed';
  messages: InterviewMessage[];
  assessment?: SkillAssessment;
}

export type OnboardingStep = 
  | 'welcome'
  | 'role_selection'
  | 'external_profiles'
  | 'preferences'
  | 'interview'
  | 'complete';