import React, { useState } from 'react';
import TieredProfileSection, { FieldTier } from './TieredProfileSection';
import Input from '../../ui/Input';
import Button from '../../ui/Button';
import { School, Calendar, PlusCircle, Trash2 } from 'lucide-react';
import { useProfile } from '../../../contexts/ProfileContext';

interface TieredEducationProps {
  forceMode?: 'onboarding' | 'profile';
  hideTitle?: boolean;
  hideDescription?: boolean;
  hideSaveButton?: boolean;
}

interface Education {
  id: string;
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  current: boolean;
  gpa?: string;
  activities?: string;
}

const TieredEducation: React.FC<TieredEducationProps> = ({ 
  forceMode,
  hideTitle,
  hideDescription,
  hideSaveButton 
}) => {
  const { profileData, updateProfile } = useProfile();
  
  // Initialize state from profile data
  const [educations, setEducations] = useState<Education[]>(
    profileData?.educations || []
  );
  
  const [newEducation, setNewEducation] = useState<Partial<Education>>({
    school: '',
    degree: '',
    field: '',
    startDate: '',
    endDate: '',
    current: false
  });
  
  const [isAddingEducation, setIsAddingEducation] = useState(false);
  const [educationLevel, setEducationLevel] = useState(
    profileData?.education_level || 'bachelors'
  );
  
  // Handle education level selection
  const handleEducationLevelChange = (level: string) => {
    setEducationLevel(level);
    updateProfile({ education_level: level });
  };
  
  // Handle adding a new education
  const handleAddEducation = () => {
    if (!newEducation.school || !newEducation.degree) return;
    
    const newEducationItem: Education = {
      id: Date.now().toString(),
      school: newEducation.school || '',
      degree: newEducation.degree || '',
      field: newEducation.field || '',
      startDate: newEducation.startDate || '',
      endDate: newEducation.endDate || '',
      current: newEducation.current || false,
      gpa: newEducation.gpa,
      activities: newEducation.activities
    };
    
    const updatedEducations = [...educations, newEducationItem];
    setEducations(updatedEducations);
    updateProfile({ educations: updatedEducations });
    
    // Reset form
    setNewEducation({
      school: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      current: false
    });
    
    setIsAddingEducation(false);
  };
  
  // Handle removing an education
  const handleRemoveEducation = (id: string) => {
    const updatedEducations = educations.filter(edu => edu.id !== id);
    setEducations(updatedEducations);
    updateProfile({ educations: updatedEducations });
  };
  
  // Handle updating new education fields
  const handleNewEducationChange = (field: string, value: string | boolean) => {
    setNewEducation({
      ...newEducation,
      [field]: value
    });
  };
  
  // Essential Education Level Component (Tier 1)
  const EducationLevelComponent = (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-white mb-3">Highest Education Level</h3>
      <div className="grid grid-cols-2 gap-3">
        {[
          { id: 'high_school', label: 'High School' },
          { id: 'associate', label: 'Associate Degree' },
          { id: 'bachelors', label: 'Bachelor\'s Degree' },
          { id: 'masters', label: 'Master\'s Degree' },
          { id: 'doctorate', label: 'Doctorate' },
          { id: 'other', label: 'Other' },
        ].map(level => (
          <div
            key={level.id}
            className={`
              rounded-lg border p-3 cursor-pointer transition-all
              ${
                educationLevel === level.id
                  ? 'border-purple-500 bg-purple-900/20'
                  : 'border-gray-700 hover:border-gray-500'
              }
            `}
            onClick={() => handleEducationLevelChange(level.id)}
          >
            <div className="flex items-center">
              <div
                className={`
                  w-4 h-4 rounded-full mr-2 border
                  ${
                    educationLevel === level.id
                      ? 'border-purple-500 bg-purple-500'
                      : 'border-gray-500'
                  }
                `}
              ></div>
              <span className="text-gray-200">{level.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  
  // Important Current Education Component (Tier 2)
  const PrimaryEducationComponent = (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-white">Education History</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsAddingEducation(true)}
          className="flex items-center"
        >
          <PlusCircle className="h-4 w-4 mr-1" /> Add
        </Button>
      </div>
      
      {educations.length === 0 && !isAddingEducation && (
        <div className="border border-dashed border-gray-700 rounded-lg p-6 text-center">
          <School className="h-8 w-8 text-gray-500 mx-auto mb-3" />
          <p className="text-gray-400">
            No education history added yet. Click "Add" to include your educational background.
          </p>
        </div>
      )}
      
      {/* List of education entries */}
      {educations.map(education => (
        <div
          key={education.id}
          className="bg-gray-800/40 rounded-lg p-4 mb-3 border border-gray-700"
        >
          <div className="flex justify-between">
            <div>
              <h4 className="font-medium text-white">{education.school}</h4>
              <p className="text-gray-300 text-sm">
                {education.degree}{education.field ? `, ${education.field}` : ''}
              </p>
              <p className="text-gray-400 text-sm mt-1">
                {education.startDate} - {education.current ? 'Present' : education.endDate}
              </p>
            </div>
            <button
              className="text-gray-500 hover:text-red-400"
              onClick={() => handleRemoveEducation(education.id)}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
      
      {/* Add education form */}
      {isAddingEducation && (
        <div className="bg-gray-800/40 rounded-lg p-4 border border-gray-700 mt-4">
          <h4 className="font-medium text-white mb-3">Add Education</h4>
          <div className="space-y-3">
            <Input
              label="School/University"
              placeholder="Enter school name"
              leftIcon={<School className="h-5 w-5" />}
              value={newEducation.school || ''}
              onChange={(e) => handleNewEducationChange('school', e.target.value)}
            />
            
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Degree"
                placeholder="e.g. Bachelor's"
                value={newEducation.degree || ''}
                onChange={(e) => handleNewEducationChange('degree', e.target.value)}
              />
              
              <Input
                label="Field of Study"
                placeholder="e.g. Computer Science"
                value={newEducation.field || ''}
                onChange={(e) => handleNewEducationChange('field', e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Start Date"
                placeholder="MM/YYYY"
                leftIcon={<Calendar className="h-5 w-5" />}
                value={newEducation.startDate || ''}
                onChange={(e) => handleNewEducationChange('startDate', e.target.value)}
              />
              
              <Input
                label="End Date"
                placeholder={newEducation.current ? 'Present' : 'MM/YYYY'}
                leftIcon={<Calendar className="h-5 w-5" />}
                value={newEducation.endDate || ''}
                onChange={(e) => handleNewEducationChange('endDate', e.target.value)}
                disabled={newEducation.current}
              />
            </div>
            
            <div className="flex items-center mt-2">
              <input
                type="checkbox"
                id="current-education"
                checked={newEducation.current || false}
                onChange={(e) => handleNewEducationChange('current', e.target.checked)}
                className="h-4 w-4 border-gray-600 rounded bg-gray-700 text-purple-600 focus:ring-purple-500"
              />
              <label htmlFor="current-education" className="ml-2 text-sm text-gray-300">
                I am currently studying here
              </label>
            </div>
            
            <div className="flex justify-end space-x-3 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddingEducation(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleAddEducation}
                disabled={!newEducation.school || !newEducation.degree}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  
  // Comprehensive Education Details Component (Tier 3)
  const EducationDetailsComponent = (
    <div className="mt-6">
      <h3 className="text-lg font-medium text-white mb-3">Advanced Education Details</h3>
      
      {educations.length > 0 && (
        <div className="space-y-4">
          {educations.map((education, index) => (
            <div
              key={`details-${education.id}`}
              className="bg-gray-800/40 rounded-lg p-4 border border-gray-700"
            >
              <h4 className="font-medium text-white mb-2">{education.school}</h4>
              
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">GPA (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. 3.8/4.0"
                    className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md"
                    value={education.gpa || ''}
                    onChange={(e) => {
                      const updatedEducations = [...educations];
                      updatedEducations[index] = {
                        ...updatedEducations[index],
                        gpa: e.target.value
                      };
                      setEducations(updatedEducations);
                      updateProfile({ educations: updatedEducations });
                    }}
                  />
                </div>
                
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Graduation Honors</label>
                  <select
                    className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md"
                    onChange={(e) => {
                      const updatedEducations = [...educations];
                      updatedEducations[index] = {
                        ...updatedEducations[index],
                        honors: e.target.value
                      };
                      setEducations(updatedEducations);
                      updateProfile({ educations: updatedEducations });
                    }}
                  >
                    <option value="">Select honors</option>
                    <option value="cum_laude">Cum Laude</option>
                    <option value="magna_cum_laude">Magna Cum Laude</option>
                    <option value="summa_cum_laude">Summa Cum Laude</option>
                    <option value="honors">Honors</option>
                    <option value="distinction">Distinction</option>
                    <option value="high_distinction">High Distinction</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-xs text-gray-400 mb-1">Activities & Societies</label>
                <textarea
                  className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md"
                  rows={2}
                  placeholder="Clubs, sports, leadership positions, etc."
                  value={education.activities || ''}
                  onChange={(e) => {
                    const updatedEducations = [...educations];
                    updatedEducations[index] = {
                      ...updatedEducations[index],
                      activities: e.target.value
                    };
                    setEducations(updatedEducations);
                    updateProfile({ educations: updatedEducations });
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
      
      {educations.length === 0 && (
        <p className="text-gray-400 text-sm">
          Add education entries above to include more detailed information.
        </p>
      )}
    </div>
  );
  
  // Define all fields with their tiers
  const fields = [
    {
      id: 'education-level',
      tier: FieldTier.ESSENTIAL,
      component: EducationLevelComponent,
      label: 'Education Level',
      required: true
    },
    {
      id: 'primary-education',
      tier: FieldTier.IMPORTANT,
      component: PrimaryEducationComponent,
      label: 'Education History'
    },
    {
      id: 'education-details',
      tier: FieldTier.COMPREHENSIVE,
      component: EducationDetailsComponent,
      label: 'Education Details'
    }
  ];
  
  // Create the save handler
  const handleSave = () => {
    console.log('Saving education data');
    // In a real implementation, would call the profile context saveProfile method
  };
  
  return (
    <TieredProfileSection
      title="Education"
      description="Share your educational background with potential employers"
      sectionId="education-section"
      fields={fields}
      onSave={handleSave}
      forceMode={forceMode}
      hideTitle={hideTitle || forceMode === 'onboarding'}
      hideDescription={hideDescription || forceMode === 'onboarding'}
      hideSaveButton={hideSaveButton}
    />
  );
};

export default TieredEducation; 