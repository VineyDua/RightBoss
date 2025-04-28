import React, { useState, useEffect, useRef, useCallback } from 'react';
import TieredProfileSection, { FieldTier } from './TieredProfileSection';
import Input from '../../ui/Input';
import { User as UserIcon, Mail, Phone, MapPin, Briefcase, Globe, Linkedin, Github } from 'lucide-react';
import { useProfile } from '../../../contexts/ProfileContext';
import { useUser } from '../../../contexts/UserContext';

interface TieredPersonalInfoProps {
  forceMode?: 'onboarding' | 'profile';
  hideTitle?: boolean;
  hideDescription?: boolean;
  hideSaveButton?: boolean;
  onValidationChange?: (valid: boolean) => void;
}

// Extended ProfileData with additional fields used in this component
interface ExtendedProfileData {
  phone?: string;
  location?: string;
  title?: string;
  bio?: string;
}

const TieredPersonalInfo: React.FC<TieredPersonalInfoProps> = ({ 
  forceMode,
  hideTitle,
  hideDescription,
  hideSaveButton,
  onValidationChange
}) => {
  const { profileData, updateProfile } = useProfile();
  const { user } = useUser();
  
  // Track profile data version to detect changes
  const profileDataRef = useRef<any>(null);
  const initializedRef = useRef(false);
  
  // Initialize state from profile data or user context
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [title, setTitle] = useState('');
  const [bio, setBio] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [personalWebsite, setPersonalWebsite] = useState('');
  //const [isLoading, setIsLoading] = useState(true);

  // Validate fields and update parent
  const validateAndNotify = useCallback(() => {
    const nameValid = fullName.trim().length >= 2;
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const phoneValid = !phone.trim() || /^\+?[\d\s-()]{10,}$/.test(phone);
    
    const isValidNow = nameValid && emailValid && phoneValid;
    
    console.log('TieredPersonalInfo: Running validation', {
      nameValid,
      emailValid,
      phoneValid,
      isValidNow,
      fullName: fullName.trim(),
      email,
      phone,
      hasOnValidationChange: !!onValidationChange
    });

    // Always notify parent of validation state
    if (onValidationChange) {
      console.log('TieredPersonalInfo: Notifying parent of validation state:', isValidNow);
      onValidationChange(isValidNow);
    }

    return isValidNow;
  }, [fullName, email, phone, onValidationChange]);

  // Effect to initialize data from profile or user context
  useEffect(() => {
    const initializeFields = async () => {
      console.log('TieredPersonalInfo: Starting initialization', {
        hasProfileData: !!profileData,
        hasUser: !!user,
        isInitialized: initializedRef.current
      });

      // Skip if already initialized or no data available
      if (initializedRef.current || (!profileData && !user)) {
        return;
      }

      try {
        setIsLoading(true);
        
        // Initialize values from profileData first, then fall back to user metadata
        const newFullName = profileData?.full_name || 
          user?.user_metadata?.full_name || 
          `${user?.user_metadata?.given_name || ''} ${user?.user_metadata?.family_name || ''}`.trim() || 
          '';
          
        const newEmail = profileData?.email || user?.email || '';
        const newPhone = profileData?.phone_number || user?.user_metadata?.phone || '';
        const newLocation = profileData?.location || user?.user_metadata?.location || '';
        const newTitle = profileData?.title || user?.user_metadata?.title || '';
        const newBio = profileData?.bio || user?.user_metadata?.bio || '';
        const newLinkedinUrl = profileData?.linkedin_url || user?.user_metadata?.linkedin_url || '';
        const newGithubUrl = profileData?.github_url || user?.user_metadata?.github_url || '';
        const newPersonalWebsite = profileData?.website_url || user?.user_metadata?.website_url || '';

        console.log('TieredPersonalInfo: Setting initial values', {
          newFullName,
          newEmail,
          newPhone
        });

        // Batch set all values
        setFullName(newFullName);
        setEmail(newEmail);
        setPhone(newPhone);
        setLocation(newLocation);
        setTitle(newTitle);
        setBio(newBio);
        setLinkedinUrl(newLinkedinUrl);
        setGithubUrl(newGithubUrl);
        setPersonalWebsite(newPersonalWebsite);

        // Mark as initialized if we have core required values
        if (newFullName && newEmail) {
          initializedRef.current = true;
          
          // Run validation after state updates
          setTimeout(() => {
            const isValid = validateAndNotify();
            console.log('TieredPersonalInfo: Initial validation result:', isValid);
          }, 0);
        }

        // Store reference for change detection
        profileDataRef.current = profileData;
      } finally {
        setIsLoading(false);
      }
    };

    initializeFields();
  }, [profileData, user, validateAndNotify]);

  // Reset initialization and revalidate if profile data changes significantly
  useEffect(() => {
    if (profileData && profileDataRef.current && 
        (profileData.id !== profileDataRef.current.id || 
         profileData.full_name !== profileDataRef.current.full_name)) {
      console.log('TieredPersonalInfo: Profile data changed significantly, resetting');
      initializedRef.current = false;
      profileDataRef.current = null;
      validateAndNotify();
    }
  }, [profileData, validateAndNotify]);

  // Run validation whenever fields change
  useEffect(() => {
    if (initializedRef.current) {
      console.log('TieredPersonalInfo: Fields changed, running validation');
      validateAndNotify();
    }
  }, [fullName, email, phone, validateAndNotify]);

  // Handle field changes
  const handleChange = (field: string, value: string) => {
    console.log('TieredPersonalInfo: Field change', { field, value });
    
    // Update local state
    switch (field) {
      case 'fullName':
        setFullName(value);
        break;
      case 'email':
        setEmail(value);
        break;
      case 'phone':
        setPhone(value);
        break;
      case 'location':
        setLocation(value);
        break;
      case 'title':
        setTitle(value);
        break;
      case 'bio':
        setBio(value);
        break;
      case 'linkedinUrl':
        setLinkedinUrl(value);
        break;
      case 'githubUrl':
        setGithubUrl(value);
        break;
      case 'personalWebsite':
        setPersonalWebsite(value);
        break;
    }

    // Map field name to profile key
    const profileKey = mapFieldToProfileKey(field);
    
    // Update profile if needed
    if (profileData) {
      let needsUpdate = false;
      
      switch(profileKey) {
        case 'full_name':
          needsUpdate = profileData.full_name !== value;
          break;
        case 'email':
          needsUpdate = profileData.email !== value;
          break;
        case 'phone_number':
          needsUpdate = profileData.phone_number !== value;
          break;
        case 'location':
          needsUpdate = profileData.location !== value;
          break;
        case 'title':
          needsUpdate = (profileData as ExtendedProfileData).title !== value;
          break;
        case 'bio':
          needsUpdate = (profileData as ExtendedProfileData).bio !== value;
          break;
        case 'linkedin_url':
          needsUpdate = profileData.linkedin_url !== value;
          break;
        case 'github_url':
          needsUpdate = profileData.github_url !== value;
          break;
        case 'website_url':
          needsUpdate = profileData.website_url !== value;
          break;
      }
      
      if (needsUpdate) {
        try {
          updateProfile({
            [profileKey]: value
          });
        } catch (error) {
          console.error('Error updating profile data:', error);
        }
      }
    }
  };
  
  // Map our field names to profile data keys
  const mapFieldToProfileKey = (field: string): string => {
    const mapping: Record<string, string> = {
      fullName: 'full_name',
      email: 'email',
      phone: 'phone_number',
      location: 'location',
      title: 'title',
      bio: 'bio',
      linkedinUrl: 'linkedin_url',
      githubUrl: 'github_url',
      personalWebsite: 'website_url'
    };
    
    return mapping[field] || field;
  };
  
  // Essential Personal Info Component (Tier 1)
  const BasicInfoComponent = (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-5">
        <Input
          label="Full Name"
          placeholder="Enter your full name"
          leftIcon={<UserIcon className="h-5 w-5" />}
          value={fullName}
          onChange={(e) => handleChange('fullName', e.target.value)}
          required
          valid={fullName.trim().length > 0} // Relaxed validation
          helpText="Your full name will be shown to potential employers and used for professional communications."
          className="bg-gray-800/60"
          id="fullName"
          name="fullName"
          autoComplete="name"
          // Handle auto-filled values
          onFocus={(e) => {
            const value = e.target.value;
            if (value && value !== fullName) {
              handleChange('fullName', value);
            }
          }}
          // Also handle blur to catch any changes
          onBlur={(e) => {
            const value = e.target.value;
            if (value && value !== fullName) {
              handleChange('fullName', value);
            }
          }}
        />
        
        <Input
          label="Email"
          placeholder="Enter your email address"
          leftIcon={<Mail className="h-5 w-5" />}
          value={email}
          onChange={(e) => handleChange('email', e.target.value)}
          disabled={!!user?.email} // Disable if provided by auth
          hint={user?.email ? "Email provided by your account" : ""}
          required
          valid={email.includes('@') && email.includes('.')}
          className="bg-gray-800/60"
          id="email"
          name="email"
          autoComplete="email"
          // Handle auto-filled values
          onFocus={(e) => {
            const value = e.target.value;
            if (value && value !== email && !user?.email) {
              handleChange('email', value);
            }
          }}
          // Also handle blur to catch any changes
          onBlur={(e) => {
            const value = e.target.value;
            if (value && value !== email && !user?.email) {
              handleChange('email', value);
            }
          }}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input
            label="Phone Number"
            placeholder="Enter your phone number"
            leftIcon={<Phone className="h-5 w-5" />}
            value={phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            helpText="Used only for important communications. Format: +1 (123) 456-7890"
            className="bg-gray-800/60"
            autoComplete="tel"
          />
          
          <Input
            label="Current Location"
            placeholder="City, State, Country"
            leftIcon={<MapPin className="h-5 w-5" />}
            value={location}
            onChange={(e) => handleChange('location', e.target.value)}
            helpText="Your general location helps match you with relevant opportunities"
            className="bg-gray-800/60"
            autoComplete="address-level2"
          />
        </div>
      </div>
    </div>
  );
  
  // Important Professional Details Component (Tier 2)
  const ProfessionalDetailsComponent = (
    <div className="mt-6">
      <h3 className="text-lg font-medium text-white mb-3">Professional Details</h3>
      <div className="space-y-4">
        <Input
          label="Job Title"
          placeholder="e.g. Senior Frontend Developer"
          leftIcon={<Briefcase className="h-5 w-5" />}
          value={title}
          onChange={(e) => handleChange('title', e.target.value)}
        />
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Professional Bio
          </label>
          <textarea
            className="w-full px-3 py-2 bg-gray-800 text-white border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            rows={4}
            placeholder="Share a brief overview of your professional background..."
            value={bio}
            onChange={(e) => handleChange('bio', e.target.value)}
          />
          <p className="mt-1 text-sm text-gray-400">
            A concise description of your experience and expertise
          </p>
        </div>
      </div>
    </div>
  );
  
  // Comprehensive Social Links Component (Tier 3)
  const SocialLinksComponent = (
    <div className="mt-6">
      <h3 className="text-lg font-medium text-white mb-3">Professional Links</h3>
      <div className="space-y-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="LinkedIn Profile"
          placeholder="https://linkedin.com/in/yourusername"
          leftIcon={<Linkedin className="h-5 w-5" />}
          value={linkedinUrl}
          onChange={(e) => handleChange('linkedinUrl', e.target.value)}
        />
        
        <Input
          label="GitHub Profile"
          placeholder="https://github.com/yourusername"
          leftIcon={<Github className="h-5 w-5" />}
          value={githubUrl}
          onChange={(e) => handleChange('githubUrl', e.target.value)}
        />
        
        <Input
          label="Personal Website"
          placeholder="https://yourwebsite.com"
          leftIcon={<Globe className="h-5 w-5" />}
          value={personalWebsite}
          onChange={(e) => handleChange('personalWebsite', e.target.value)}
          className="md:col-span-2"
        />
      </div>
    </div>
  );
  
  // Define all fields with their tiers
  const fields = [
    {
      id: 'basic-info',
      tier: FieldTier.ESSENTIAL,
      component: BasicInfoComponent,
      label: 'Basic Information',
      required: true
    },
    {
      id: 'professional-details',
      tier: FieldTier.IMPORTANT,
      component: ProfessionalDetailsComponent,
      label: 'Professional Details'
    },
    {
      id: 'social-links',
      tier: FieldTier.COMPREHENSIVE,
      component: SocialLinksComponent,
      label: 'Social Links'
    }
  ];
  
  // Create the save handler
  const handleSave = async () => {
    console.log('TieredPersonalInfo: handleSave called with data:', {
      full_name: fullName,
      email: email,
      phone_number: phone,
      location: location,
      title: title,
      bio: bio,
      linkedin_url: linkedinUrl,
      github_url: githubUrl,
      website_url: personalWebsite
    });
    
    try {
      await updateProfile({
        full_name: fullName,
        email: email,
        phone_number: phone,
        location: location,
        title: title,
        bio: bio,
        linkedin_url: linkedinUrl,
        github_url: githubUrl,
        website_url: personalWebsite
      });
      
      return true;
    } catch (error) {
      console.error('Error saving profile:', error);
      return false;
    }
  };
  
  return (
    <TieredProfileSection
      title="Personal Information"
      description="Tell us about yourself so companies can get to know you"
      sectionId="personal-info-form"
      fields={fields}
      onSave={handleSave}
      forceMode={forceMode}
      hideTitle={hideTitle || forceMode === 'onboarding'}
      hideDescription={hideDescription || forceMode === 'onboarding'}
      hideSaveButton={hideSaveButton}
      onValidationChange={(valid) => {
        if (onValidationChange) {
          onValidationChange(valid);
        }
      }}
    />
  );
};

export default TieredPersonalInfo; 