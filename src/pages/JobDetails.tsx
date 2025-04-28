import React from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Building2, Clock, DollarSign, Briefcase, CheckCircle2, ArrowLeft } from 'lucide-react';
import Header from '../components/layout/Header';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { useNavigation } from '../hooks/useNavigation';
import { JobMatch } from '../types';

// This would typically come from an API call using the jobId
const getJobDetails = (jobId: string): JobMatch | undefined => {
  const mockJobMatches: JobMatch[] = [
    {
      id: '1',
      company: {
        id: '101',
        name: 'Uncountable',
        logo: '',
        location: 'Multiple Locations',
        description: 'Accelerating Industrial R&D with AI and machine learning to optimize experimental workflows.',
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
        description: 'Building next-generation developer tools to streamline software engineering workflows.',
      },
      role: 'Product Manager',
      matchPercentage: 85,
      status: 'pending',
    },
  ];

  return mockJobMatches.find(job => job.id === jobId);
};

const JobDetails: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const { goToDashboard } = useNavigation();
  const job = jobId ? getJobDetails(jobId) : undefined;

  if (!job) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Job Not Found</h2>
            <p className="text-gray-400 mb-6">The job you're looking for doesn't exist or has been removed.</p>
            <Button variant="primary" gradient onClick={goToDashboard}>
              Return to Dashboard
            </Button>
          </Card>
        </main>
      </div>
    );
  }

  const handleApply = () => {
    console.log('Applying to job:', job.id);
  };

  const handleSave = () => {
    console.log('Saving job:', job.id);
  };

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={goToDashboard}
          className="flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Dashboard
        </button>

        <Card className="overflow-hidden">
          <div className="border-b border-gray-800 p-6">
            <div className="flex items-start gap-6">
              <div className="h-20 w-20 bg-gray-800 rounded-lg flex items-center justify-center p-4">
                <img
                  src={job.company.logo || 'https://via.placeholder.com/80'}
                  alt={job.company.name}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-white">{job.role}</h1>
                <div className="flex items-center gap-2 mt-2 text-gray-400">
                  <Building2 className="h-4 w-4" />
                  <span>{job.company.name}</span>
                  <span className="text-gray-600">•</span>
                  <MapPin className="h-4 w-4" />
                  <span>{job.company.location}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleSave}
                >
                  Save
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  gradient
                  onClick={handleApply}
                >
                  Apply Now
                </Button>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card className="p-4 bg-gray-800/50">
                <div className="flex items-center gap-2 text-gray-300 mb-1">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">Experience</span>
                </div>
                <p className="text-white font-medium">3-5 years</p>
              </Card>
              
              <Card className="p-4 bg-gray-800/50">
                <div className="flex items-center gap-2 text-gray-300 mb-1">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-sm">Compensation</span>
                </div>
                <p className="text-white font-medium">$120k - $180k</p>
              </Card>
              
              <Card className="p-4 bg-gray-800/50">
                <div className="flex items-center gap-2 text-gray-300 mb-1">
                  <Briefcase className="h-4 w-4" />
                  <span className="text-sm">Employment Type</span>
                </div>
                <p className="text-white font-medium">Full-time</p>
              </Card>
            </div>
            
            <div className="prose prose-invert max-w-none">
              <h2 className="text-xl font-semibold text-white mb-4">About the Role</h2>
              <p className="text-gray-300 mb-6">
                {job.company.description}
              </p>
              
              <h2 className="text-xl font-semibold text-white mb-4">Requirements</h2>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>3+ years of experience in frontend development</li>
                <li>Strong proficiency in React and TypeScript</li>
                <li>Experience with modern frontend build tools and workflows</li>
                <li>Understanding of UI/UX principles</li>
                <li>Excellent problem-solving skills</li>
              </ul>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default JobDetails;