import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Briefcase, LineChart, Building2, Bell, CheckCircle2, X } from 'lucide-react';
import Header from '../components/layout/Header';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import JobMatchCard from '../components/features/JobMatchCard';
import CompanyCard from '../components/features/CompanyCard';
import SkillRadarChart from '../components/features/SkillRadarChart';
import { JobMatch, Company } from '../types';
import { useUser } from '../contexts/UserContext';
import { useProfile } from '../contexts/ProfileContext';
import { useNavigation } from '../hooks/useNavigation';
import LoadingScreen from '../components/ui/LoadingScreen';
import CollapsibleDebugPanel from '../components/ui/CollapsibleDebugPanel';
import { useDebug } from '../components/ui/DebugController';

// Mock data
const mockUser = {
  name: 'Viney Dua',
  profilePicture: undefined,
};

const mockJobMatches: JobMatch[] = [
  {
    id: '1',
    company: {
      id: '101',
      name: 'Uncountable',
      logo: '',
      location: 'Multiple Locations',
      description: 'Accelerating Industrial R&D with AI',
    },
    role: 'Senior Frontend Engineer',
    matchPercentage: 92,
    status: 'active',
  },
  {
    id: '2',
    company: {
      id: '102',
      name: 'TechFlow',
      logo: '',
      location: 'San Francisco, CA',
      description: 'Building next-generation developer tools',
    },
    role: 'Product Manager',
    matchPercentage: 85,
    status: 'pending',
  },
  {
    id: '3',
    company: {
      id: '103',
      name: 'HealthCare (YC)',
      logo: '',
      location: 'San Francisco, CA',
      description: 'AI-powered solutions for Health Systems',
    },
    role: 'Engineering Manager',
    matchPercentage: 78,
    status: 'pending',
  },
];

const mockCompanies: Company[] = [
  {
    id: '101',
    name: 'Uncountable',
    logo: '',
    location: 'Multiple Locations',
    description: 'Accelerating Industrial R&D with AI and machine learning to optimize experimental workflows.',
  },
  {
    id: '102',
    name: 'TechFlow',
    logo: '',
    location: 'San Francisco, CA',
    description: 'Building next-generation developer tools to streamline software engineering workflows.',
  },
  {
    id: '103',
    name: 'HealthCare (YC)',
    logo: '',
    location: 'San Francisco, CA',
    description: 'AI-powered solutions for Health Systems improving patient outcomes and operational efficiency.',
  },
];

const mockSkills = [
  { name: 'React', level: 90 },
  { name: 'TypeScript', level: 85 },
  { name: 'UI/UX', level: 75 },
  { name: 'Communication', level: 95 },
  { name: 'System Design', level: 70 },
  { name: 'Problem Solving', level: 85 },
];

const Dashboard: React.FC = () => {
  const { goToOnboarding, goToJobDetails } = useNavigation();
  const { user, profile, isLoading: userLoading } = useUser();
  const { isOnboardingComplete, isLoading: profileLoading } = useProfile();
  const { isDebugEnabled } = useDebug();
  const [activeJobMatches, setActiveJobMatches] = useState<JobMatch[]>(mockJobMatches);
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(true);
  const [redirectingToOnboarding, setRedirectingToOnboarding] = useState(false);
  
  // Log component lifecycle and check onboarding status
  useEffect(() => {
    console.log('Dashboard mounted:', { 
      hasUser: !!user, 
      email: user?.email,
      hasProfile: !!profile,
      isLoading: userLoading || profileLoading,
      isOnboardingComplete
    });

    // Use a timeout to allow the ProfileContext to fully load, 
    // but NOT redirect if the context is still loading
    if (!userLoading && !profileLoading) {
      // Now it's safe to check onboarding completion
      if (!isOnboardingComplete) {
        console.log('Dashboard: Onboarding not complete, redirecting to onboarding after delay');
        
        // Use a longer timeout to ensure all data is settled
        const redirectTimer = setTimeout(() => {
          console.log('Dashboard: Now redirecting to onboarding');
          setRedirectingToOnboarding(true);
          goToOnboarding();
        }, 1000); // Shorter delay since we already confirmed loading is complete
        
        return () => clearTimeout(redirectTimer);
      } else {
        console.log('Dashboard: Onboarding is complete, showing dashboard');
      }
    }

    return () => {
      console.log('Dashboard unmounted');
    };
  }, [userLoading, profileLoading, isOnboardingComplete, goToOnboarding, user, profile]);

  // Separate loading states for better UX
  if (userLoading || profileLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black">
        {isDebugEnabled && (
          <CollapsibleDebugPanel
            title="Dashboard Debug Info"
            initiallyExpanded={false}
            position="top-right"
            items={[
              { label: "User Loading", value: userLoading },
              { label: "Profile Loading", value: profileLoading },
              { label: "User", value: user ? user.email : 'null' },
              { label: "Onboarding Complete", value: isOnboardingComplete },
              { label: "Has Profile", value: !!profile },
            ]}
          />
        )}
        <LoadingScreen message="Loading your dashboard..." />
        <div className="text-center mt-4">
          <p className="text-gray-400">Please wait while we load your information...</p>
          <p className="text-gray-500 text-sm mt-2">This may take a few moments after signing in</p>
        </div>
      </div>
    );
  }

  // Separate redirecting state
  if (redirectingToOnboarding) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black">
        {isDebugEnabled && (
          <CollapsibleDebugPanel
            title="Dashboard Debug Info"
            initiallyExpanded={false}
            position="top-right"
            items={[
              { label: "Redirecting", value: redirectingToOnboarding },
              { label: "Onboarding Complete", value: isOnboardingComplete, color: '#FF6347', highlight: true },
              { label: "User", value: user ? user.email : 'null' },
            ]}
          />
        )}
        <LoadingScreen message="Redirecting to onboarding..." />
        <div className="text-center mt-4">
          <p className="text-red-400">Onboarding incomplete. Redirecting to setup...</p>
        </div>
      </div>
    );
  }

  // Explicitly check for onboarding status before showing content
  if (!isOnboardingComplete) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black">
        {isDebugEnabled && (
          <CollapsibleDebugPanel
            title="Dashboard Debug Info"
            initiallyExpanded={false}
            position="top-right"
            items={[
              { label: "Onboarding Complete", value: isOnboardingComplete, color: '#FF6347', highlight: true },
              { label: "User", value: user ? user.email : 'null' },
              { label: "User Loading", value: userLoading },
              { label: "Profile Loading", value: profileLoading },
            ]}
          />
        )}
        <LoadingScreen message="Checking your profile status..." />
        <div className="text-center mt-4">
          <p className="text-yellow-400">Verifying your onboarding status...</p>
        </div>
      </div>
    );
  }

  const handleAcceptJob = (jobId: string) => {
    setActiveJobMatches(prevMatches => 
      prevMatches.map(match => 
        match.id === jobId ? { ...match, status: 'active' as const } : match
      )
    );
  };
  
  const handleDeclineJob = (jobId: string) => {
    setActiveJobMatches(prevMatches => 
      prevMatches.map(match => 
        match.id === jobId ? { ...match, status: 'declined' as const } : match
      )
    );
  };

  const handleViewJob = (job: JobMatch) => {
    goToJobDetails(job.id);
  };

  return (
    <div className="min-h-screen bg-black">
      {isDebugEnabled && (
        <CollapsibleDebugPanel
          title="Dashboard Debug Info"
          initiallyExpanded={false}
          position="top-right"
          items={[
            { label: "User", value: user ? user.email : 'null' },
            { label: "Onboarding Complete", value: isOnboardingComplete, color: '#90EE90', highlight: true },
            { label: "Profile Name", value: profile?.full_name || 'Not set' },
            { label: "Has Profile", value: !!profile },
          ]}
        />
      )}
      <Header user={mockUser} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {showWelcomeBanner && (
          <Card className="mb-8 overflow-hidden bg-gradient-to-r from-gray-900 via-purple-900/20 to-gray-900">
            <div className="p-6 relative">
              <button
                onClick={() => setShowWelcomeBanner(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              
              <div className="space-y-8">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Step 1: You're In</h3>
                    <p className="text-gray-300">You've completed your profile — resume, preferences, the whole deal. That's all we need to get started.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Step 2: We're Doing the Work</h3>
                    <p className="text-gray-300">You don't need to apply to anything. We're actively matching your profile against opportunities at top companies in our portfolio.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Step 3: You're on the Fast Track</h3>
                    <p className="text-gray-300">We'll introduce you directly to Recruiting manager who are excited to meet you. No need to wait around.</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Welcome back, {mockUser.name.split(' ')[0]}</h1>
          <p className="text-gray-400 mt-1">
            Your profile is active and being matched with opportunities
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="p-4 sm:p-6">
            <div className="flex items-center">
              <div className="h-10 sm:h-12 w-10 sm:w-12 bg-purple-900/30 rounded-full flex items-center justify-center mr-4">
                <Briefcase className="h-5 sm:h-6 w-5 sm:w-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-white">3</h3>
                <p className="text-sm text-gray-400">Active Job Matches</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 sm:p-6">
            <div className="flex items-center">
              <div className="h-10 sm:h-12 w-10 sm:w-12 bg-pink-900/30 rounded-full flex items-center justify-center mr-4">
                <LineChart className="h-5 sm:h-6 w-5 sm:w-6 text-pink-400" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-white">5</h3>
                <p className="text-sm text-gray-400">Profile Views This Week</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 sm:p-6">
            <div className="flex items-center">
              <div className="h-10 sm:h-12 w-10 sm:w-12 bg-blue-900/30 rounded-full flex items-center justify-center mr-4">
                <Building2 className="h-5 sm:h-6 w-5 sm:w-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-white">8</h3>
                <p className="text-sm text-gray-400">Companies Following You</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg sm:text-xl font-semibold text-white">Job Matches</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                rightIcon={<ChevronRight className="h-4 w-4" />}
                className="hidden sm:flex"
              >
                View All
              </Button>
            </div>
            
            <div className="space-y-4">
              {activeJobMatches.map(jobMatch => (
                <JobMatchCard
                  key={jobMatch.id}
                  jobMatch={jobMatch}
                  onView={handleViewJob}
                  onAccept={handleAcceptJob}
                  onDecline={handleDeclineJob}
                />
              ))}
            </div>
          
            <div className="flex justify-between items-center mt-8 sm:mt-10 mb-2">
              <h2 className="text-lg sm:text-xl font-semibold text-white">Companies Interested In You</h2>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="hidden sm:flex">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" className="hidden sm:flex">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {mockCompanies.slice(0, 2).map(company => (
                <CompanyCard
                  key={company.id}
                  company={company}
                  highlight={company.id === '101'}
                  onLearnMore={(id) => console.log('Learn more about company', id)}
                  onRefer={(id) => console.log('Refer company', id)}
                />
              ))}
            </div>
          </div>
          
          <div className="space-y-6">
            <Card className="p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Skills Assessment</h2>
              <SkillRadarChart 
                skills={mockSkills} 
                size={240} 
                className="mx-auto mb-4 scale-90 sm:scale-100" 
              />
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-300 mb-2">Top Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {mockSkills
                    .sort((a, b) => b.level - a.level)
                    .slice(0, 4)
                    .map(skill => (
                      <span
                        key={skill.name}
                        className="px-3 py-1 bg-gray-800 rounded-full text-xs text-gray-300"
                      >
                        {skill.name}
                      </span>
                    ))
                  }
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                fullWidth
                className="mt-4"
              >
                View Full Assessment
              </Button>
            </Card>
            
            <Card className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-white">Recent Notifications</h2>
                <Bell className="h-5 w-5 text-gray-400" />
              </div>
              <div className="space-y-4">
                <div className="border-l-2 border-purple-500 pl-3 py-1">
                  <p className="text-sm text-gray-300">New job match with <span className="font-medium text-white">TechFlow</span></p>
                  <span className="text-xs text-gray-500">2 hours ago</span>
                </div>
                <div className="border-l-2 border-blue-500 pl-3 py-1">
                  <p className="text-sm text-gray-300">Your profile was viewed by <span className="font-medium text-white">HealthCare (YC)</span></p>
                  <span className="text-xs text-gray-500">Yesterday</span>
                </div>
                <div className="border-l-2 border-green-500 pl-3 py-1">
                  <p className="text-sm text-gray-300">AI Interview assessment ready for review</p>
                  <span className="text-xs text-gray-500">2 days ago</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                fullWidth
                className="mt-4"
              >
                View All Notifications
              </Button>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;