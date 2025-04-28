import React from 'react';
import { Clock, CheckCircle2, X } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { ProgressBar } from '../ui/ProgressBar';
import { JobMatch } from '../../types';

interface JobMatchCardProps {
  jobMatch: JobMatch;
  onView: (jobMatch: JobMatch) => void;
  onAccept?: (jobId: string) => void;
  onDecline?: (jobId: string) => void;
}

const JobMatchCard: React.FC<JobMatchCardProps> = ({
  jobMatch,
  onView,
  onAccept,
  onDecline,
}) => {
  const getStatusIcon = () => {
    switch (jobMatch.status) {
      case 'active':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'accepted':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'declined':
        return <X className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusText = () => {
    switch (jobMatch.status) {
      case 'active':
        return 'Active';
      case 'accepted':
        return 'Accepted';
      case 'declined':
        return 'Declined';
      default:
        return 'Pending';
    }
  };

  return (
    <Card hoverable bordered className="overflow-hidden">
      <div className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 sm:gap-0 mb-4">
          <div>
            <h3 className="text-lg sm:text-xl font-semibold text-white">{jobMatch.role}</h3>
            <p className="text-gray-400">{jobMatch.company.name}</p>
            <div className="flex items-center mt-1">
              <span className="text-sm text-gray-400">{jobMatch.company.location}</span>
            </div>
          </div>
          
          <div className="flex sm:flex-col items-center sm:items-end">
            <div className="flex items-center space-x-1">
              <span className="font-semibold text-lg text-white">{jobMatch.matchPercentage}%</span>
              <span className="text-xs text-purple-400">match</span>
            </div>
            <div className="flex items-center ml-4 sm:ml-0 sm:mt-2">
              {getStatusIcon()}
              <span className="ml-1 text-sm">{getStatusText()}</span>
            </div>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-400">Match Strength</span>
            <span className="text-gray-300">{jobMatch.matchPercentage}%</span>
          </div>
          <ProgressBar 
            value={jobMatch.matchPercentage} 
            size="md" 
            showValue={true}
            color="gradient"
          />
        </div>
        
        {jobMatch.status === 'pending' && (
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <Button
              variant="outline"
              size="sm"
              fullWidth
              leftIcon={<X className="h-4 w-4" />}
              onClick={() => onDecline && onDecline(jobMatch.id)}
            >
              Decline
            </Button>
            <Button
              variant="primary"
              size="sm"
              fullWidth
              gradient
              leftIcon={<CheckCircle2 className="h-4 w-4" />}
              onClick={() => onAccept && onAccept(jobMatch.id)}
            >
              Accept
            </Button>
          </div>
        )}
        
        
        {jobMatch.status !== 'pending' && (
          <Button
            variant="primary"
            size="sm"
            fullWidth
            gradient={jobMatch.status === 'active'}
            onClick={() => onView(jobMatch)}
          >
            View Details
          </Button>
        )}
      </div>
    </Card>
  );
};

export default JobMatchCard;