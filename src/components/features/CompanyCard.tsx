import React from 'react';
import { ExternalLink } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Company } from '../../types';

interface CompanyCardProps {
  company: Company;
  highlight?: boolean;
  onLearnMore?: (companyId: string) => void;
  onRefer?: (companyId: string) => void;
}

const CompanyCard: React.FC<CompanyCardProps> = ({
  company,
  highlight = false,
  onLearnMore,
  onRefer,
}) => {
  return (
    <Card 
      hoverable 
      className={`overflow-hidden transition-all duration-300 ${
        highlight ? 'border border-purple-500 shadow-lg shadow-purple-500/20' : ''
      }`}
    >
      <div className="p-4 sm:p-5 flex flex-col h-full">
        <div className="flex items-start sm:items-center justify-between mb-4">
          <div className="h-12 sm:h-16 w-12 sm:w-16 bg-gray-800 rounded-lg flex items-center justify-center p-2">
            <img
              src={company.logo || 'https://via.placeholder.com/64'}
              alt={company.name}
              className="max-h-full max-w-full object-contain"
            />
          </div>
          
          <div className="flex flex-col items-end">
            <h3 className="text-lg sm:text-xl font-bold text-white">{company.name}</h3>
            <span className="px-2 sm:px-3 py-1 bg-gray-800 rounded-full text-xs text-gray-300 mt-1">
              {company.location}
            </span>
          </div>
        </div>
        
        <p className="text-gray-400 line-clamp-3 mb-4 text-sm flex-grow">
          {company.description}
        </p>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onLearnMore && onLearnMore(company.id)}
            className="flex-1"
          >
            Learn More
          </Button>
          <Button
            variant="primary"
            size="sm"
            gradient
            onClick={() => onRefer && onRefer(company.id)}
            className="flex-1"
          >
            Refer a Friend
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default CompanyCard;