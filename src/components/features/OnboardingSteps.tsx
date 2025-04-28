import React from 'react';
import { CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react';
import { OnboardingStep } from '../../types';
import Button from '../ui/Button';

interface OnboardingStepConfig {
  id: OnboardingStep;
  title: string;
  description: string;
  icon?: React.ReactNode;
  isOptional?: boolean;
  estimatedTime?: string;
}

interface OnboardingStepsProps {
  steps: OnboardingStepConfig[];
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  onStepChange?: (step: OnboardingStep) => void;
  showNavigation?: boolean;
  showProgress?: boolean;
  showTimeEstimate?: boolean;
  className?: string;
}

const OnboardingSteps: React.FC<OnboardingStepsProps> = ({
  steps,
  currentStep,
  completedSteps,
  onStepChange,
  showNavigation = true,
  showProgress = true,
  showTimeEstimate = true,
  className = ''
}) => {
  const currentIndex = steps.findIndex(step => step.id === currentStep);
  const totalSteps = steps.length;
  const progress = ((completedSteps.length / totalSteps) * 100).toFixed(0);

  const handleNext = () => {
    if (currentIndex < totalSteps - 1) {
      onStepChange?.(steps[currentIndex + 1].id);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      onStepChange?.(steps[currentIndex - 1].id);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Progress bar */}
      {showProgress && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">Progress</span>
            <span className="text-sm text-gray-400">{progress}%</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-600 to-pink-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Steps */}
      <div className="space-y-6">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = currentStep === step.id;
          const isUpcoming = !isCompleted && !isCurrent;
          
          return (
            <div key={step.id} className="relative">
              {/* Step indicator */}
              <div className="flex items-start">
                <div className="flex flex-col items-center mr-4">
                  <div
                    className={`rounded-full flex items-center justify-center w-10 h-10 flex-shrink-0 transition-all duration-300 ${
                      isCompleted
                        ? 'bg-purple-600 text-white'
                        : isCurrent
                        ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg shadow-purple-500/20'
                        : 'bg-gray-800 text-gray-500'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-6 w-6" />
                    ) : step.icon ? (
                      step.icon
                    ) : (
                      <span className="text-lg font-semibold">{index + 1}</span>
                    )}
                  </div>
                  
                  {/* Connector line */}
                  {index < steps.length - 1 && (
                    <div
                      className={`h-full w-0.5 transition-colors duration-300 ${
                        isCompleted ? 'bg-purple-600' : 'bg-gray-700'
                      }`}
                    />
                  )}
                </div>
                
                <div className="mt-1 mb-8 flex-grow">
                  <div className="flex items-center justify-between">
                    <h3
                      className={`text-lg font-semibold transition-colors duration-300 ${
                        isUpcoming ? 'text-gray-400' : 'text-white'
                      }`}
                    >
                      {step.title}
                      {step.isOptional && (
                        <span className="ml-2 text-xs text-gray-500">(Optional)</span>
                      )}
                    </h3>
                    {showTimeEstimate && step.estimatedTime && (
                      <span className="text-xs text-gray-500">{step.estimatedTime}</span>
                    )}
                  </div>
                  <p
                    className={`mt-1 text-sm transition-colors duration-300 ${
                      isUpcoming ? 'text-gray-500' : 'text-gray-400'
                    }`}
                  >
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation buttons */}
      {showNavigation && (
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            leftIcon={<ChevronLeft className="h-4 w-4" />}
          >
            Previous
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleNext}
            disabled={currentIndex === totalSteps - 1}
            rightIcon={<ChevronRight className="h-4 w-4" />}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default OnboardingSteps;