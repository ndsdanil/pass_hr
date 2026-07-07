import { apiClient } from './client';

export interface Resume {
  id: number;
  original_text: string;
  title: string | null;
  created_at: string;
  job_descriptions: JobDescription[];
  tuned_resumes: TunedResume[];
}

export interface JobDescription {
  id: number;
  description_text: string;
  title: string | null;
  created_at: string;
}

export interface TunedResume {
  id: number;
  job_description_id: number;
  resume_id: number;
  tuned_text: string | null;
  cover_letter: string | null;
  gap_analysis_and_score: string | null;
  tokens_used: number | null;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  error_message: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface ResumeCreate {
  original_text: string;
  title?: string;
  filename?: string;
}

export interface JobDescriptionCreate {
  description_text: string;
  title?: string;
}

export interface JobDescriptionUpdate {
  description_text?: string;
  title?: string;
}

export interface TunedResumeCreate {
  job_description_id: number;
}

// Get all resumes
export const getResumes = async (): Promise<Resume[]> => {
  const response = await apiClient.get('/resume/');
  return response.data;
};

// Get single resume with job descriptions and tuned resumes
export const getResume = async (resumeId: number): Promise<Resume> => {
  const response = await apiClient.get(`/resume/${resumeId}`);
  return response.data;
};

// Create new resume
export const createResume = async (data: ResumeCreate): Promise<Resume> => {
  const response = await apiClient.post('/resume/', data);
  return response.data;
};

// Add job description to resume
export const addJobDescription = async (resumeId: number, data: JobDescriptionCreate): Promise<JobDescription> => {
  const response = await apiClient.post(`/resume/${resumeId}/job-descriptions`, data);
  return response.data;
};

// Start resume tuning
export const startTuning = async (resumeId: number, data: TunedResumeCreate): Promise<TunedResume> => {
  const response = await apiClient.post(`/resume/${resumeId}/tune`, data);
  return response.data;
};

// Get tuning status
export const getTuningStatus = async (tuned_resume_id: number): Promise<TunedResume> => {
  const response = await apiClient.get(`/resume/tuning/${tuned_resume_id}`);
  return response.data;
};

/**
 * Периодически опрашивает статус тюнинга резюме до его завершения
 * @param tuned_resume_id ID оптимизированного резюме
 * @param onComplete Колбэк, вызываемый при завершении тюнинга
 * @param interval Интервал опроса в миллисекундах
 * @param maxAttempts Максимальное количество попыток
 */
export const pollTuningStatus = async (
  tuned_resume_id: number,
  onComplete: (result: TunedResume) => void,
  interval = 1000,
  maxAttempts = 180
): Promise<void> => {
  let attempts = 0;
  
  // console.log(`Starting polling for tuned resume #${tuned_resume_id}`);
  
  const poll = async () => {
    try {
      attempts++;
      // console.log(`Poll attempt ${attempts}/${maxAttempts} for tuned resume #${tuned_resume_id}`);
      
      const result = await getTuningStatus(tuned_resume_id);
      // console.log(`Tuning status for #${tuned_resume_id}: ${result.status}`);
      
      // Если тюнинг завершен или произошла ошибка
      if (result.status === 'completed' || result.status === 'failed') {
        // console.log(`Tuning ${result.status} for #${tuned_resume_id}. Calling onComplete.`);
        onComplete(result);
        return;
      }
      
      // Если достигнуто максимальное количество попыток
      if (attempts >= maxAttempts) {
        // console.warn(`Maximum polling attempts (${maxAttempts}) reached for tuned resume #${tuned_resume_id}`);
        return;
      }
      
      // Продолжаем опрос через указанный интервал
      setTimeout(poll, interval);
    } catch (error) {
      // console.error(`Error polling status for tuned resume #${tuned_resume_id}:`, error);
      // Продолжаем опрос даже при ошибке, но с увеличенным интервалом
      setTimeout(poll, interval * 2);
    }
  };
  
  // Начинаем опрос
  await poll();
};

// Normalize resume text
export const normalizeResumeText = async (text: string): Promise<string> => {
  const response = await apiClient.post('/resume/normalize', { text });
  return response.data.normalized_text;
};

// Update resume title
export const updateResumeTitle = async (resumeId: number, title: string): Promise<Resume> => {
  const response = await apiClient.patch(`/resume/${resumeId}`, { title });
  return response.data;
};

// Delete resume
export const deleteResume = async (resumeId: number): Promise<void> => {
  await apiClient.delete(`/resume/${resumeId}`);
};

// Update job description
export const updateJobDescription = async (
  resumeId: number,
  jobDescriptionId: number,
  data: JobDescriptionUpdate
): Promise<JobDescription> => {
  const response = await apiClient.patch(
    `/resume/${resumeId}/job-descriptions/${jobDescriptionId}`,
    data
  );
  return response.data;
};

// Delete job description
export const deleteJobDescription = async (
  resumeId: number,
  jobDescriptionId: number
): Promise<void> => {
  await apiClient.delete(
    `/resume/${resumeId}/job-descriptions/${jobDescriptionId}`
  );
}; 