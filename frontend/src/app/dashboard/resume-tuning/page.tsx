'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getResumes, createResume, normalizeResumeText, updateResumeTitle, deleteResume } from '@/api/resume';
import { extractTextFromPdf, isPdfFile, validatePdfSize } from '@/utils/pdfUtils';

interface Resume {
  id: number;
  original_text: string;
  title: string | null;
  created_at: string;
  job_descriptions: JobDescription[];
  tuned_resumes: TunedResume[];
}

interface JobDescription {
  id: number;
  description_text: string;
  created_at: string;
}

interface TunedResume {
  id: number;
  resume_id: number;
  job_description_id: number;
  tuned_text: string | null;
  cover_letter: string | null;
  status: string;
  error_message: string | null;
  created_at: string;
  updated_at: string | null;
  tokens_used?: number;
}

interface ResumeCreate {
  original_text: string;
  filename?: string;
}

export default function ResumeTuning() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [resumeText, setResumeText] = useState('');
  const [isProcessingPdf, setIsProcessingPdf] = useState(false);
  const [isNormalizing, setIsNormalizing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStep, setUploadStep] = useState<'idle' | 'extracting' | 'formatting' | 'saving'>('idle');
  const [normalizationProgress, setNormalizationProgress] = useState(0);
  const [uploadMethod, setUploadMethod] = useState<'text' | 'file'>('file');
  const [isDragging, setIsDragging] = useState(false);
  const normalizationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [editingResumeId, setEditingResumeId] = useState<number | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [resumeToDelete, setResumeToDelete] = useState<number | null>(null);

  useEffect(() => {
    loadResumes();
  }, []);

  const loadResumes = async () => {
    try {
      const data = await getResumes();
      setResumes(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load resumes');
      setLoading(false);
    }
  };

  const startNormalizationProgress = () => {
    setNormalizationProgress(0);
    
    if (normalizationTimeoutRef.current) {
      clearInterval(normalizationTimeoutRef.current);
    }
    
    normalizationTimeoutRef.current = setInterval(() => {
      setNormalizationProgress((prev) => {
        if (prev < 90) {
          return prev + (90 - prev) * 0.1;
        }
        return prev;
      });
    }, 500);
  };

  const stopNormalizationProgress = () => {
    if (normalizationTimeoutRef.current) {
      clearInterval(normalizationTimeoutRef.current);
      normalizationTimeoutRef.current = null;
    }
    setNormalizationProgress(100);
    
    setTimeout(() => {
      setNormalizationProgress(0);
    }, 500);
  };

  // Function to update overall upload progress
  const updateUploadProgress = (step: 'extracting' | 'formatting' | 'saving', progress: number) => {
    setUploadStep(step);
    
    // Assign weights for each stage
    const weights = {
      extracting: 0.2, // 20% on extracting text
      formatting: 0.5, // 50% on formatting text
      saving: 0.3      // 30% on saving resume
    };
    
    // Calculate total progress
    let totalProgress = 0;
    
    if (step === 'extracting') {
      totalProgress = progress * weights.extracting;
    } else if (step === 'formatting') {
      totalProgress = weights.extracting * 100 + progress * weights.formatting;
    } else if (step === 'saving') {
      totalProgress = (weights.extracting + weights.formatting) * 100 + progress * weights.saving;
    }
    
    setUploadProgress(Math.min(Math.round(totalProgress), 99)); // Leave 100% for completion
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessingPdf(true);
      setError(null);
      setUploadStep('extracting');
      setUploadProgress(0);

      if (!isPdfFile(file)) {
        throw new Error('Please upload a PDF file');
      }

      if (!validatePdfSize(file)) {
        throw new Error('PDF file size should not exceed 10MB');
      }

      // Stage 1: Extracting text from PDF
      updateUploadProgress('extracting', 30);
      await new Promise(resolve => setTimeout(resolve, 500));
      updateUploadProgress('extracting', 70);
      
      const text = await extractTextFromPdf(file);
      if (!text.trim()) {
        throw new Error('PDF file does not contain text. It might be a scanned document or file contains only images.');
      }
      
      updateUploadProgress('extracting', 100);
      setResumeText(text);
      
      // Stage 2: Formatting text
      setIsNormalizing(true);
      updateUploadProgress('formatting', 10);
      
      let formattedText;
      try {
        // Simulate formatting progress
        const formatProgressInterval = setInterval(() => {
          setNormalizationProgress(prev => {
            const newProgress = prev + (90 - prev) * 0.1;
            updateUploadProgress('formatting', newProgress);
            return newProgress < 90 ? newProgress : 90;
          });
        }, 500);
        
        formattedText = await normalizeResumeText(text);
        
        clearInterval(formatProgressInterval);
        setNormalizationProgress(100);
        updateUploadProgress('formatting', 100);
      } catch (err) {
        console.error('Error normalizing text:', err);
        formattedText = text;
        setError('Failed to improve text formatting, using original text.');
      } finally {
        setIsNormalizing(false);
      }
      
      // Stage 3: Saving resume
      setIsSaving(true);
      updateUploadProgress('saving', 30);
      
      const data: ResumeCreate = {
        original_text: formattedText,
        filename: file.name
      };
      
      updateUploadProgress('saving', 70);
      
      const newResume = await createResume(data);
      setResumes([newResume, ...resumes]);
      
      updateUploadProgress('saving', 100);
      setUploadProgress(100);
      
      // Completing the process
      setTimeout(() => {
        setShowUploadForm(false);
        setResumeText('');
        setUploadMethod('file');
        setUploadStep('idle');
        setUploadProgress(0);
      }, 500);
      
    } catch (err) {
      console.error('Error processing PDF:', err);
      
      setError(err instanceof Error ? err.message : 'An unknown error occurred while processing the PDF file');
    } finally {
      setIsProcessingPdf(false);
      setIsNormalizing(false);
      setIsSaving(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleResumeUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      
      // Format text only once when submitting form
      setIsNormalizing(true);
      startNormalizationProgress();
      
      let formattedText;
      try {
        formattedText = await normalizeResumeText(resumeText);
      } catch (err) {
        console.error('Error normalizing text:', err);
        formattedText = resumeText;
        setError('Failed to improve text formatting, using original text.');
      } finally {
        setIsNormalizing(false);
        stopNormalizationProgress();
      }
      
      const data: ResumeCreate = {
        original_text: formattedText,
      };

      // If file upload method is used and fileInputRef exists
      if (uploadMethod === 'file' && fileInputRef.current?.files?.[0]) {
        data.filename = fileInputRef.current.files[0].name;
      }

      const newResume = await createResume(data);
      setResumes([newResume, ...resumes]);
      setShowUploadForm(false);
      setResumeText('');
      setUploadMethod('file');
    } catch (err) {
      console.error('Error uploading resume:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload resume');
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    try {
      setIsProcessingPdf(true);
      setError(null);
      setUploadStep('extracting');
      setUploadProgress(0);

      if (!isPdfFile(file)) {
        throw new Error('Please upload a PDF file');
      }

      if (!validatePdfSize(file)) {
        throw new Error('PDF file size should not exceed 10MB');
      }

      // Stage 1: Extracting text from PDF
      updateUploadProgress('extracting', 30);
      await new Promise(resolve => setTimeout(resolve, 500));
      updateUploadProgress('extracting', 70);
      
      const text = await extractTextFromPdf(file);
      if (!text.trim()) {
        throw new Error('PDF file does not contain text. It might be a scanned document or file contains only images.');
      }
      
      updateUploadProgress('extracting', 100);
      setResumeText(text);
      
      // Stage 2: Formatting text
      setIsNormalizing(true);
      updateUploadProgress('formatting', 10);
      
      let formattedText;
      try {
        // Simulate formatting progress
        const formatProgressInterval = setInterval(() => {
          setNormalizationProgress(prev => {
            const newProgress = prev + (90 - prev) * 0.1;
            updateUploadProgress('formatting', newProgress);
            return newProgress < 90 ? newProgress : 90;
          });
        }, 500);
        
        formattedText = await normalizeResumeText(text);
        
        clearInterval(formatProgressInterval);
        setNormalizationProgress(100);
        updateUploadProgress('formatting', 100);
      } catch (err) {
        console.error('Error normalizing text:', err);
        formattedText = text;
        setError('Failed to improve text formatting, using original text.');
      } finally {
        setIsNormalizing(false);
      }
      
      // Stage 3: Saving resume
      setIsSaving(true);
      updateUploadProgress('saving', 30);
      
      const data: ResumeCreate = {
        original_text: formattedText,
        filename: file.name
      };
      
      updateUploadProgress('saving', 70);
      
      const newResume = await createResume(data);
      setResumes([newResume, ...resumes]);
      
      updateUploadProgress('saving', 100);
      setUploadProgress(100);
      
      // Completing the process
      setTimeout(() => {
        setShowUploadForm(false);
        setResumeText('');
        setUploadMethod('file');
        setUploadStep('idle');
        setUploadProgress(0);
      }, 500);
      
    } catch (err) {
      console.error('Error processing PDF:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred while processing the PDF file');
    } finally {
      setIsProcessingPdf(false);
      setIsNormalizing(false);
      setIsSaving(false);
    }
  };

  const handleUpdateTitle = async (resumeId: number) => {
    try {
      await updateResumeTitle(resumeId, newTitle);
      setEditingResumeId(null);
      setNewTitle('');
      loadResumes();
    } catch (err) {
      setError('Failed to update resume title');
    }
  };

  const handleDeleteResume = async (resumeId: number) => {
    try {
      await deleteResume(resumeId);
      setResumeToDelete(null);
      loadResumes();
    } catch (err) {
      setError('Failed to delete resume');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="border-b border-gray-700 pb-5">
        <h1 className="text-2xl font-bold leading-7 text-white sm:truncate sm:text-3xl">
          Resume Tuning
        </h1>
        <p className="mt-2 text-sm text-gray-400">
          Improve your resume with AI to increase your chances of getting interviews
        </p>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-3">
          <button
            onClick={() => setShowUploadForm(true)}
            className="inline-flex items-center rounded-md bg-gradient-to-r from-orange-500 to-yellow-500 px-3 py-2 text-sm font-semibold text-black shadow-sm hover:from-orange-600 hover:to-yellow-600 transition-all duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Upload New Resume
          </button>
        </div>
      </div>

      {/* Upload Form */}
      {showUploadForm && (
        <div className="bg-gray-900 border border-gray-700 shadow sm:rounded-lg p-4">
          <form onSubmit={handleResumeUpload} className="space-y-4">
            {/* Upload Method Selector */}
            <div className="flex space-x-2 mb-4">
              <button
                type="button"
                onClick={() => setUploadMethod('file')}
                className={`px-4 py-2 rounded-md transition-colors ${
                  uploadMethod === 'file'
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500'
                    : 'bg-gray-800 text-gray-300 border border-gray-600 hover:bg-gray-700'
                }`}
              >
                Upload PDF
              </button>
              <button
                type="button"
                onClick={() => setUploadMethod('text')}
                className={`px-4 py-2 rounded-md transition-colors ${
                  uploadMethod === 'text'
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500'
                    : 'bg-gray-800 text-gray-300 border border-gray-600 hover:bg-gray-700'
                }`}
              >
                Paste Text
              </button>
            </div>

            {/* Overall progress indicator */}
            {(isProcessingPdf || isNormalizing || isSaving) && uploadStep !== 'idle' && (
              <div className="relative mb-4 p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-orange-500 mr-3"></div>
                  <p className="text-sm text-orange-400">
                    {uploadStep === 'extracting' && 'Extracting text from PDF...'}
                    {uploadStep === 'formatting' && 'Improving text formatting...'}
                    {uploadStep === 'saving' && 'Saving resume...'}
                  </p>
                </div>
                <div className="mt-2 w-full">
                  <div className="bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
                <div className="mt-1 flex justify-between text-xs text-gray-400">
                  <span>Extracting</span>
                  <span>Formatting</span>
                  <span>Saving</span>
                </div>
              </div>
            )}

            {uploadMethod === 'file' ? (
              <div
                className={`relative border-2 border-dashed rounded-lg p-6 ${
                  isDragging ? 'border-orange-500 bg-orange-500/10' : 'border-gray-600 bg-gray-800'
                }`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".pdf"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <div className="mt-4 flex text-sm leading-6 text-gray-300">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer rounded-md font-semibold text-orange-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-orange-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-900 hover:text-orange-300"
                    >
                      <span></span>
                    </label>
                    <p className="pl-1">Click here to upload a PDF file or drag and drop</p>
                  </div>
                  <p className="text-xs leading-5 text-gray-400">Up to 10MB</p>
                </div>
              </div>
            ) : (
              <div className="relative">
                <label htmlFor="resumeText" className="block text-sm font-medium text-gray-300">
                  Paste your resume text
                </label>
                <textarea
                  id="resumeText"
                  rows={10}
                  className="mt-2 block w-full rounded-lg border-2 border-gray-600 bg-gray-800 shadow-sm 
                    focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 
                    hover:border-gray-500 transition-colors duration-200
                    text-base px-4 py-3 placeholder-gray-400 text-white"
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value.slice(0, 25000))}
                  placeholder="Paste your resume text here..."
                  maxLength={25000}
                  required
                />
                <p className={`mt-1 text-xs text-right ${resumeText.length > 23000 ? 'text-red-400' : 'text-gray-500'}`}>
                  {resumeText.length.toLocaleString()} / 25,000
                </p>
                {uploadMethod === 'text' && resumeText.trim() && (
                  <p className="mt-2 text-sm text-gray-400 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    You can edit the text before submitting
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-400">
                <p className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  By clicking "Upload", we will automatically improve text formatting
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setShowUploadForm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800 border border-gray-600 rounded-md shadow-sm hover:bg-gray-700 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isNormalizing || isProcessingPdf || !resumeText.trim()}
                  className={`px-4 py-2 text-sm font-medium rounded-md shadow-sm transition-all duration-200 ${
                    isNormalizing || isProcessingPdf || !resumeText.trim()
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-orange-500 to-yellow-500 text-black hover:from-orange-600 hover:to-yellow-600'
                  }`}
                >
                  Upload
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Resumes List */}
      <div className="bg-gray-900 border border-gray-700 shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-700">
          {resumes.map((resume) => (
            <li key={resume.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    {editingResumeId === resume.id ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          className="block w-full rounded-md border-gray-600 bg-gray-800 text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                          placeholder="Enter new title"
                        />
                        <button
                          onClick={() => handleUpdateTitle(resume.id)}
                          className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-black bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingResumeId(null);
                            setNewTitle('');
                          }}
                          className="inline-flex items-center px-2.5 py-1.5 border border-gray-600 text-xs font-medium rounded text-gray-300 bg-gray-800 hover:bg-gray-700"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-white truncate">
                          {resume.title || `Resume #${resume.id}`}
                        </p>
                        <button
                          onClick={() => {
                            setEditingResumeId(resume.id);
                            setNewTitle(resume.title || '');
                          }}
                          className="text-gray-400 hover:text-orange-400"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                        </button>
                      </div>
                    )}
                    <p className="text-sm text-gray-400">
                      Uploaded: {resume.created_at ? new Date(resume.created_at).toLocaleDateString() : 'Recently'}
                    </p>
                    <div className="flex space-x-4">
                      <p className="text-sm text-gray-400">
                        Job Descriptions: {resume.job_descriptions?.length || 0}
                      </p>
                      <p className="text-sm text-gray-400">
                        Tuned Versions: {resume.tuned_resumes?.length || 0}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/dashboard/resume-tuning/${resume.id}`}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-black bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600"
                    >
                      View Details
                    </Link>
                    <button
                      onClick={() => setResumeToDelete(resume.id)}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {resumes.length === 0 && (
          <div className="text-center py-12">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="mx-auto h-12 w-12 text-gray-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-white">No resumes</h3>
            <p className="mt-1 text-sm text-gray-400">Get started by uploading a new resume.</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {resumeToDelete && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-black opacity-75"></div>
            </div>
            <div className="inline-block align-bottom bg-gray-900 border border-gray-700 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-white">
                    Delete Resume
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-400">
                      Are you sure you want to delete this resume? This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="button"
                  onClick={() => handleDeleteResume(resumeToDelete)}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:ring-offset-gray-900 sm:col-start-2 sm:text-sm"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => setResumeToDelete(null)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-600 shadow-sm px-4 py-2 bg-gray-800 text-base font-medium text-gray-300 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 focus:ring-offset-gray-900 sm:mt-0 sm:col-start-1 sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-md bg-red-900/20 border border-red-700/30 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-400">{error}</h3>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 