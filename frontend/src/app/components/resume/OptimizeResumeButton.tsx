'use client';

import { useState } from 'react';
import { resumeApi, type TuneResumeRequest, type OptimizedResume } from '@/app/lib/api';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface OptimizeResumeButtonProps {
  resumeId: number;
  jobDescriptionId: number;
  onSuccess?: (optimizedResume: OptimizedResume) => void;
}

export function OptimizeResumeButton({ resumeId, jobDescriptionId, onSuccess }: OptimizeResumeButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [optimizedResume, setOptimizedResume] = useState<OptimizedResume | null>(null);

  const handleOptimize = async () => {
    try {
      setIsLoading(true);
      const data: TuneResumeRequest = {
        resume_id: resumeId,
        job_description_id: jobDescriptionId
      };
      
      const result = await resumeApi.optimizeWithTuner(data);
      setOptimizedResume(result);
      setShowResults(true);
      
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (error) {
      console.error('Error optimizing resume:', error);
      toast.error('Failed to optimize resume. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <>
      <Button 
        onClick={handleOptimize} 
        disabled={isLoading}
        variant="default"
        className="w-full md:w-auto"
      >
        {isLoading ? <Spinner className="mr-2" /> : null}
        {isLoading ? 'Optimizing...' : 'Optimize Resume'}
      </Button>
      
      {showResults && optimizedResume && (
        <Dialog open={showResults} onOpenChange={setShowResults}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Resume Optimization Results</DialogTitle>
              <DialogDescription>
                Here are the results of your resume optimization
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4 space-y-4">
              <div>
                <h3 className="text-lg font-medium">Optimized Resume:</h3>
                <div className="mt-2 p-4 bg-gray-50 rounded-md whitespace-pre-wrap">
                  {optimizedResume.optimized_resume}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium">Languages:</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge variant="secondary">Job: {optimizedResume.languages.job_language}</Badge>
                  <Badge variant="secondary">Resume: {optimizedResume.languages.original_resume_language}</Badge>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium">Missing Keywords:</h3>
                <div className="mt-2 space-y-2">
                  <div>
                    <h4 className="font-medium">Skills:</h4>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {optimizedResume.missing_keywords.skills.length > 0 ? (
                        optimizedResume.missing_keywords.skills.map((skill, index) => (
                          <Badge key={index} variant="outline">{skill}</Badge>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">No missing skills</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium">Experience:</h4>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {optimizedResume.missing_keywords.experience.length > 0 ? (
                        optimizedResume.missing_keywords.experience.map((exp, index) => (
                          <Badge key={index} variant="outline">{exp}</Badge>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">No missing experience</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium">Similarity Metrics:</h3>
                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 rounded-md">
                    <p className="text-sm font-medium">Skills Similarity:</p>
                    <p className="text-2xl font-bold">
                      {(optimizedResume.final_metrics.skills_similarity * 100).toFixed(0)}%
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-md">
                    <p className="text-sm font-medium">Experience Similarity:</p>
                    <p className="text-2xl font-bold">
                      {(optimizedResume.final_metrics.experience_similarity * 100).toFixed(0)}%
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-md">
                    <p className="text-sm font-medium">Text Similarity:</p>
                    <p className="text-2xl font-bold">
                      {(optimizedResume.final_metrics.text_similarity * 100).toFixed(0)}%
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-md">
                    <p className="text-sm font-medium">Overall Match:</p>
                    <p className="text-2xl font-bold flex items-center">
                      {((optimizedResume.final_metrics.skills_similarity + 
                         optimizedResume.final_metrics.experience_similarity + 
                         optimizedResume.final_metrics.text_similarity) / 3 * 100).toFixed(0)}%
                      {((optimizedResume.final_metrics.skills_similarity + 
                         optimizedResume.final_metrics.experience_similarity + 
                         optimizedResume.final_metrics.text_similarity) / 3) > 0.7 ? (
                        <CheckCircle className="ml-2 text-green-500" size={24} />
                      ) : (
                        <XCircle className="ml-2 text-red-500" size={24} />
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                onClick={() => setShowResults(false)} 
                className="w-full md:w-auto"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
} 