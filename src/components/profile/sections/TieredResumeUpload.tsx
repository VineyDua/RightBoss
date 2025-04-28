import React, { useState, useCallback } from 'react';
import TieredProfileSection, { FieldTier } from './TieredProfileSection';
import { useProfile } from '../../../contexts/ProfileContext';
import { Upload, FileText, X, Check } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface TieredResumeUploadProps {
  forceMode?: 'onboarding' | 'profile';
  hideTitle?: boolean;
  hideDescription?: boolean;
  hideSaveButton?: boolean;
}

const TieredResumeUpload: React.FC<TieredResumeUploadProps> = ({
  forceMode,
  hideTitle,
  hideDescription,
  hideSaveButton
}) => {
  const { profileData, updateProfile } = useProfile();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileUpload = useCallback(async (file: File) => {
    try {
      setIsUploading(true);
      setError(null);
      setSuccess(false);
      setUploadProgress(0);

      // Validate file type
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(file.type)) {
        throw new Error('Please upload a PDF or Word document');
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB');
      }

      // Generate a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${profileData?.id}-${Date.now()}.${fileExt}`;
      const filePath = `resumes/${fileName}`;

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          onUploadProgress: (progress) => {
            setUploadProgress((progress.loaded / progress.total) * 100);
          }
        });

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('resumes')
        .getPublicUrl(filePath);

      // Update profile with resume information
      await updateProfile({
        resume: {
          file_url: publicUrl,
          file_name: file.name,
          upload_date: new Date().toISOString()
        }
      });

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload resume');
    } finally {
      setIsUploading(false);
    }
  }, [profileData?.id, updateProfile]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  }, [handleFileUpload]);

  const UploadArea = (
    <div
      className={`
        border-2 border-dashed rounded-lg p-8 text-center
        ${isUploading ? 'border-purple-500 bg-purple-500/10' : 'border-gray-700 hover:border-purple-500'}
        transition-colors duration-200 cursor-pointer
      `}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={() => document.getElementById('resume-upload')?.click()}
    >
      <input
        id="resume-upload"
        type="file"
        accept=".pdf,.doc,.docx"
        className="hidden"
        onChange={handleFileInput}
      />
      
      <div className="flex flex-col items-center">
        {isUploading ? (
          <>
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-300">Uploading... {Math.round(uploadProgress)}%</p>
          </>
        ) : (
          <>
            <Upload className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-300 mb-2">Drag and drop your resume here</p>
            <p className="text-gray-400 text-sm">or click to browse files</p>
            <p className="text-gray-500 text-xs mt-2">PDF, DOC, DOCX (max 5MB)</p>
          </>
        )}
      </div>
    </div>
  );

  const ResumePreview = profileData?.resume && (
    <div className="mt-6 p-4 bg-gray-800 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <FileText className="w-5 h-5 text-gray-400 mr-3" />
          <div>
            <p className="text-gray-300">{profileData.resume.file_name}</p>
            <p className="text-gray-500 text-sm">
              Uploaded on {new Date(profileData.resume.upload_date).toLocaleDateString()}
            </p>
          </div>
        </div>
        <a
          href={profileData.resume.file_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-purple-500 hover:text-purple-400"
        >
          View
        </a>
      </div>
    </div>
  );

  const fields = [
    {
      id: 'resume-upload',
      tier: FieldTier.ESSENTIAL,
      component: (
        <div>
          {UploadArea}
          {error && (
            <p className="mt-4 text-red-500 text-sm">{error}</p>
          )}
          {success && (
            <p className="mt-4 text-green-500 text-sm flex items-center">
              <Check className="w-4 h-4 mr-2" />
              Resume uploaded successfully!
            </p>
          )}
          {ResumePreview}
        </div>
      ),
      label: 'Resume Upload',
      required: true
    }
  ];

  return (
    <TieredProfileSection
      title="Resume"
      description="Upload your resume to help employers learn more about your experience"
      sectionId="resume-section"
      fields={fields}
      forceMode={forceMode}
      hideTitle={hideTitle || forceMode === 'onboarding'}
      hideDescription={hideDescription || forceMode === 'onboarding'}
      hideSaveButton={hideSaveButton}
    />
  );
};

export default TieredResumeUpload; 