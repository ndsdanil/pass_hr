'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { getResume, addJobDescription, startTuning, getTuningStatus, updateJobDescription, deleteJobDescription, deleteResume, updateResumeTitle, pollTuningStatus } from '@/api/resume';
import type { Resume, JobDescription, TunedResume } from '@/api/resume';
import Link from 'next/link';
import { useTokenStore } from '@/store/tokenStore';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default function ResumeDetails({ params }: Props) {
  const router = useRouter();
  const { id } = use(params);
  const resumeId = parseInt(id);
  const { fetchBalance } = useTokenStore();

  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showJobDescForm, setShowJobDescForm] = useState(false);
  const [jobDescText, setJobDescText] = useState('');
  const [selectedJobDesc, setSelectedJobDesc] = useState<JobDescription | null>(null);
  const [tuningInProgress, setTuningInProgress] = useState(false);
  const [tuningJobDescId, setTuningJobDescId] = useState<number | null>(null);
  const [editingJobDescId, setEditingJobDescId] = useState<number | null>(null);
  const [editedJobDescText, setEditedJobDescText] = useState('');
  const [editedJobDescTitle, setEditedJobDescTitle] = useState('');
  const [jobDescToDelete, setJobDescToDelete] = useState<number | null>(null);
  const [showDeleteResumeConfirm, setShowDeleteResumeConfirm] = useState(false);
  const [expandedJobDescs, setExpandedJobDescs] = useState<Set<number>>(new Set());
  const [selectedTab, setSelectedTab] = useState<'resume' | 'cover' | 'analysis'>('resume');
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [keySkills, setKeySkills] = useState<string[]>([]);
  const [selectedTunedResume, setSelectedTunedResume] = useState<TunedResume | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showOriginalResume, setShowOriginalResume] = useState(true);
  const [showJobDescription, setShowJobDescription] = useState(true);
  const [showOptimizedResume, setShowOptimizedResume] = useState(true);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorDialogMessage, setErrorDialogMessage] = useState('');
  const [errorDialogTitle, setErrorDialogTitle] = useState('');
  const [isTokenError, setIsTokenError] = useState(false);

  useEffect(() => {
    loadResume();
  }, []);

  // Добавляем периодическое обновление данных во время тюнинга
  useEffect(() => {
    // Настраиваем интервал для периодического обновления данных,
    // чтобы отслеживать изменения в статусе тюнинга
    const intervalId = setInterval(() => {
      if (tuningInProgress) {
        loadResume();
      }
    }, 5000); // Проверяем каждые 5 секунд
    
    return () => clearInterval(intervalId);
  }, [tuningInProgress]); // Зависимость от статуса тюнинга

  const loadResume = async () => {
    try {
      const data = await getResume(resumeId);
      
      // Обновляем баланс токенов при каждой загрузке резюме
      fetchBalance();
      
      // Устанавливаем данные в состояние с небольшой задержкой для более стабильного обновления UI
      setTimeout(() => {
      setResume(data);
      
      // Инициализируем выбранное описание вакансии и оптимизированное резюме
      if (data.job_descriptions && data.job_descriptions.length > 0) {
        const firstJobDesc = data.job_descriptions[0];
        setSelectedJobDesc(firstJobDesc);
        
        // Ищем оптимизированное резюме для этого описания вакансии
        if (data.tuned_resumes && data.tuned_resumes.length > 0) {
            // Посмотрим, есть ли заверенные тюнинги
            const completedResumes = data.tuned_resumes.filter(tr => tr.status === 'completed');
            
            // Посмотрим, есть ли незавершенные тюнинги
            const inProgressResumes = data.tuned_resumes.filter(tr => tr.status === 'in_progress');
            
            // Сначала проверяем завершенные тюнинги
            let selectedTuneResume: TunedResume | null = null;
            
            // Сначала ищем завершенный тюнинг для выбранного job description
            const completedForSelected = completedResumes.find(tr => tr.job_description_id === firstJobDesc.id);
            if (completedForSelected) {
              selectedTuneResume = completedForSelected;
            } 
            // Затем ищем незавершенный тюнинг для выбранного job description
            else {
              const inProgressForSelected = inProgressResumes.find(tr => tr.job_description_id === firstJobDesc.id);
              if (inProgressForSelected) {
                selectedTuneResume = inProgressForSelected;
              } 
              // Если для выбранного job description нет тюнингов, берем любой завершенный
              else if (completedResumes.length > 0) {
                selectedTuneResume = completedResumes[0];
              }
              // Если нет завершенных, берем любой незавершенный
              else if (inProgressResumes.length > 0) {
                selectedTuneResume = inProgressResumes[0];
              }
            }
            
            if (selectedTuneResume) {
              setSelectedTunedResume(selectedTuneResume);
            }
          } else {
            console.log(`No tuned resumes found for this resume`);
          }
        } else {
          console.log(`No job descriptions found for this resume`);
      }
      
      setLoading(false);
      }, 300); // Увеличиваем задержку до 300 мс для большей надежности
    } catch (err: any) {
      console.error('Error loading resume:', err);
      setError('Failed to load resume');
      setLoading(false);
    }
  };

  const handleJobDescSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addJobDescription(resumeId, { description_text: jobDescText });
      setShowJobDescForm(false);
      setJobDescText('');
      loadResume();
    } catch (err: any) {
      setError('Failed to add job description');
    }
  };

  const handleTuneResume = async (jobDescriptionId: number) => {
    try {
      // console.log(`Starting resume tuning for job description ID: ${jobDescriptionId}`);
      setTuningInProgress(true);
      setTuningJobDescId(jobDescriptionId);
      
      // Запускаем тюнинг и получаем начальный статус
      // console.log(`Calling API to start tuning for resume ID: ${resumeId}`);
      const tunedResume = await startTuning(resumeId, { job_description_id: jobDescriptionId });
      // console.log(`Tuning started, tuned resume ID: ${tunedResume.id}, initial status: ${tunedResume.status}`);
      
      // Немедленно загружаем резюме, чтобы отобразить состояние "in_progress"
      await loadResume();
      
      // Используем функцию pollTuningStatus для периодического опроса статуса
      await pollTuningStatus(
        tunedResume.id,
        (result) => {
          // console.log(`Tuning completed callback triggered for ID: ${tunedResume.id}, status: ${result.status}`);
          
          // Обновляем данные резюме
          loadResume();
          
          // Обновляем баланс токенов
          fetchBalance();
          
          // Сбрасываем состояние тюнинга
          setTuningInProgress(false);
          setTuningJobDescId(null);
          
          // Если тюнинг завершился с ошибкой, показываем сообщение
          if (result.status === 'failed') {
            console.error(`Tuning failed for resume ID: ${resumeId}, job description ID: ${jobDescriptionId}`);
            setErrorDialogTitle('Error');
            setErrorDialogMessage('An error occurred during resume optimization. Please try again.');
            setIsTokenError(false);
            setShowErrorDialog(true);
          } else {
            // console.log(`Tuning successfully completed for resume ID: ${resumeId}, job description ID: ${jobDescriptionId}`);
          }
        },
        1000, // Интервал опроса - 1 секунда
        180  // Максимальное количество попыток - 3 минуты
      );
    } catch (err: any) {
      console.error(`Error in handleTuneResume:`, err);
      
      if (err.response?.status === 402) {
        setErrorDialogTitle('Insufficient Tokens');
        setErrorDialogMessage('You don\'t have enough tokens to perform this operation. Please purchase more tokens to continue.');
        setIsTokenError(true);
        setShowErrorDialog(true);
      } else {
        setErrorDialogTitle('Error');
        setErrorDialogMessage(`Failed to start optimization: ${err.message || 'Unknown error'}`);
        setIsTokenError(false);
        setShowErrorDialog(true);
      }
      
      setTuningInProgress(false);
      setTuningJobDescId(null);
    }
  };

  const getTunedResumeForJobDesc = (jobDescId: number): TunedResume | undefined => {
    return resume?.tuned_resumes.find(tr => tr.job_description_id === jobDescId);
  };

  // Добавим функцию для расчета процента совпадения резюме с описанием вакансии
  const calculateMatchPercentage = useCallback((jobDescText: string, tunedText: string): number => {
    if (!jobDescText || !tunedText) return 0;
    
    try {
    // Простой алгоритм оценки соответствия на основе ключевых слов
    // В реальном приложении может быть более сложная логика
    const jobDescWords = jobDescText.toLowerCase().match(/\b\w+\b/g) || [];
    const uniqueJobDescWords = new Set(jobDescWords.filter(word => word.length > 3));
    
    let matches = 0;
    uniqueJobDescWords.forEach(word => {
      if (tunedText.toLowerCase().includes(word.toLowerCase())) {
        matches++;
      }
    });
    
    return Math.min(100, Math.round((matches / Math.max(1, uniqueJobDescWords.size)) * 100));
    } catch (error) {
      console.error('Error calculating match percentage:', error);
      return 0;
    }
  }, []);

  // Get tuned resume metrics from backend
  const getTunedResumeMetrics = useCallback((tunedResume: TunedResume | undefined): any => {
    if (!tunedResume || tunedResume.status !== 'completed') {
      return {
        text_similarity: 0,
        skills_similarity: 0,
        experience_similarity: 0,
        skills_section_similarity: 0,
        experience_section_similarity: 0,
        missing_keywords: { skills: [], experience: [] }
      };
    }

    // Try to parse metrics from metadata
    try {
      // Check if metadata exists in the tunedResume object
      if (tunedResume.metrics_data) {
        let metrics = tunedResume.metrics_data;
        
        // Проверяем, является ли metrics_data строкой или объектом
        if (typeof tunedResume.metrics_data === 'string') {
          metrics = JSON.parse(tunedResume.metrics_data);
        }
        
        if (metrics && metrics.final_metrics) {
          return {
            ...metrics.final_metrics,
            missing_keywords: metrics.missing_keywords || { skills: [], experience: [] }
          };
        }
      }
    } catch (error) {
      console.error('Error parsing tuned resume metrics:', error);
    }

    // Fallback to calculating match percentage on the front end
    const jobDesc = resume?.job_descriptions.find(jd => jd.id === tunedResume.job_description_id);
    
    return {
      text_similarity: calculateMatchPercentage(
        jobDesc?.description_text || '',
        tunedResume.tuned_text || ''
      ) / 100,
      skills_similarity: 0.5, // default fallback
      experience_similarity: 0.5, // default fallback
      skills_section_similarity: 0.5, // default fallback
      experience_section_similarity: 0.5, // default fallback
      missing_keywords: { skills: [], experience: [] }
    };
  }, [resume, calculateMatchPercentage]);

  const handleUpdateJobDesc = async (jobDescId: number) => {
    try {
      await updateJobDescription(resumeId, jobDescId, {
        description_text: editedJobDescText,
        title: editedJobDescTitle
      });
      setEditingJobDescId(null);
      setEditedJobDescText('');
      setEditedJobDescTitle('');
      loadResume();
    } catch (err: any) {
      setError('Failed to update job description');
    }
  };

  // Обработчик выбора описания вакансии
  const handleSelectJobDesc = (jobDesc: JobDescription) => {
    setSelectedJobDesc(jobDesc);
    const tunedResume = resume?.tuned_resumes.find(tr => tr.job_description_id === jobDesc.id);
    
    if (resume && tunedResume && tunedResume.status === 'completed') {
      // Обновляем баланс токенов при просмотре результатов
      fetchBalance();
      
      setSelectedTunedResume(tunedResume);
      
      // Вычисляем ключевые навыки для выбранного резюме
      const skills = extractKeySkills(
        jobDesc.description_text || '', 
        resume.original_text || '', 
        tunedResume.tuned_text || ''
      );
      setKeySkills(skills);
      
      // Открываем модальное окно
      setShowModal(true);
    }
  };

  const handleDeleteJobDesc = async () => {
    if (!jobDescToDelete) return;
    
    try {
      setLoading(true);
      await deleteJobDescription(resumeId, jobDescToDelete);
      setJobDescToDelete(null);
      setError('');
      loadResume();
    } catch (err: any) {
      setError('Ошибка при удалении описания вакансии');
      console.error('Error deleting job description:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteResume = async () => {
    try {
      await deleteResume(resumeId);
      setShowDeleteResumeConfirm(false);
      router.push('/dashboard/resume-tuning');
    } catch (err: any) {
      setError('Failed to delete resume');
    }
  };

  const toggleJobDescExpand = (jobDescId: number) => {
    const newExpanded = new Set(expandedJobDescs);
    if (newExpanded.has(jobDescId)) {
      newExpanded.delete(jobDescId);
    } else {
      newExpanded.add(jobDescId);
    }
    setExpandedJobDescs(newExpanded);
  };

  const copyToClipboard = (text: string, type: 'resume' | 'cover' = 'resume') => {
    navigator.clipboard.writeText(text).then(
      () => {
        setCopySuccess(type === 'resume' ? 'Resume скопировано!' : 'Сопроводительное письмо скопировано!');
        setTimeout(() => setCopySuccess(null), 2000);
      },
      (err: any) => {
        console.error('Не удалось скопировать текст: ', err);
        setError('Не удалось скопировать текст');
      }
    );
  };

  const downloadAsFile = (text: string, filename: string) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  // Функция для извлечения ключевых навыков из описания вакансии
  const extractKeySkills = useCallback((jobDesc: string, resumeText: string, tunedText: string) => {
    // Пытаемся найти конкретное резюме с метриками
    const tunedResume = resume?.tuned_resumes.find(tr => 
      tr.job_description_id === resume?.job_descriptions.find(jd => jd.description_text === jobDesc)?.id 
      && tr.status === 'completed'
    );
    
    // Если есть метрики, извлекаем из них навыки
    if (tunedResume?.metrics_data) {
      try {
        let metrics = tunedResume.metrics_data;
        
        // Берем навыки из секции experience в метриках
        if (metrics.missing_keywords?.experience?.length > 0) {
          return metrics.missing_keywords.experience
            .filter((item: string) => item.length < 30 && !item.includes(' '))
            .slice(0, 5);
        }
      } catch (error) {
        console.error('Error extracting skills from metrics:', error);
      }
    }
    
    // Если не смогли найти навыки в метриках, используем стандартные
    return ['Vue'];
  }, [resume]);

  useEffect(() => {
    if (resume?.original_text && selectedJobDesc?.description_text && selectedTunedResume?.tuned_text && selectedTunedResume.status === 'completed') {
      const skills = extractKeySkills(selectedJobDesc.description_text, resume.original_text, selectedTunedResume.tuned_text);
      setKeySkills(skills);
    } else {
      setKeySkills([]);
    }
  }, [resume?.original_text, selectedJobDesc?.description_text, selectedTunedResume?.tuned_text, selectedTunedResume?.status, extractKeySkills]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 text-sm">Loading resume...</p>
        </div>
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-gray-400 mb-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900">Resume not found</h3>
        <p className="text-gray-500 mt-2">It may have been deleted or you do not have access</p>
        <Link href="/dashboard/resume-tuning" className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
          Back to resume list
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Error Dialog */}
      <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{errorDialogTitle}</DialogTitle>
            <DialogDescription>
              {errorDialogMessage}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            {isTokenError ? (
              <Button asChild>
                <Link href="/dashboard/tokens">Buy Tokens</Link>
              </Button>
            ) : (
              <Button onClick={() => setShowErrorDialog(false)}>Close</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Уведомление об успешном копировании */}
      {copySuccess && (
        <div className="fixed top-4 right-4 bg-green-50 border-l-4 border-green-500 p-4 z-50 shadow-lg rounded-lg animate-fade-in-out">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{copySuccess}</p>
            </div>
          </div>
        </div>
      )}

      {/* Уведомление об ошибке */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg shadow-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm text-red-700">
                {error.includes('tokens') ? 'Insufficient tokens. Please purchase tokens on the Pricing page.' : error}
                {error.includes('tokens') && (
                  <span className="ml-2">
                    <Link href="/dashboard/tokens" className="text-blue-600 hover:text-blue-800 underline font-medium">
                      Перейти к покупке токенов
                    </Link>
                  </span>
                )}
              </p>
              <button 
                onClick={() => setError(null)} 
                className="text-sm text-red-700 hover:text-red-600 font-medium underline mt-1"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 mr-2 text-orange-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              {resume.title || "Resume Details"}
            </h1>
            <p className="text-gray-400 mt-2">Tune your resume for specific job descriptions with AI</p>
          </div>
          <div className="flex gap-3">
            <Link 
              href="/dashboard/resume-tuning" 
              className="inline-flex items-center px-3 py-2 border border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 transition-colors duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
              </svg>
              Back
            </Link>
          <button
            onClick={() => setShowDeleteResumeConfirm(true)}
              className="inline-flex items-center px-3 py-2 border border-red-600 text-sm font-medium rounded-md text-red-400 bg-gray-800 hover:bg-red-900/20 shadow-sm transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
              Delete resume
          </button>
        </div>
        </div>
      </div>

      {/* Original Resume */}
      <div className="bg-gray-900 shadow-md sm:rounded-lg mb-8 border border-gray-700">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium leading-6 text-white flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-gray-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              Original resume
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => copyToClipboard(resume.original_text || '')}
                className="flex items-center space-x-1 px-2 py-1 rounded-md bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors duration-200"
                title="Copy text"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                </svg>
                <span className="text-sm font-medium">Copy</span>
              </button>
            <button
              onClick={() => {
                setExpandedJobDescs(prev => {
                  const newSet = new Set(prev);
                  if (newSet.has(-1)) {
                    newSet.delete(-1);
                  } else {
                    newSet.add(-1);
                  }
                  return newSet;
                });
              }}
              className="flex items-center space-x-1 px-2 py-1 rounded-md bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors duration-200"
            >
              <span className="text-sm font-medium">
                  {expandedJobDescs.has(-1) ? 'Hide' : 'Show'}
              </span>
              {expandedJobDescs.has(-1) ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                </svg>
              ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              )}
            </button>
          </div>
          </div>
          <div className="mt-4 max-w-full text-sm text-gray-300">
            <pre className={`whitespace-pre-wrap font-sans bg-gray-800 p-4 rounded-md border border-gray-600 text-gray-300 ${!expandedJobDescs.has(-1) ? 'line-clamp-3' : ''}`}>
              {resume.original_text}
            </pre>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-3">
          <button
            onClick={() => setShowJobDescForm(true)}
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Job Description
          </button>
        </div>
      </div>

      {/* Job Description Form */}
      {showJobDescForm && (
        <div className="bg-gray-900 shadow sm:rounded-lg p-4 border border-gray-700">
          <form onSubmit={handleJobDescSubmit} className="space-y-4">
            <div>
              <label htmlFor="jobDescText" className="block text-sm font-medium text-gray-300">
                Job Description Text
              </label>
              <textarea
                id="jobDescText"
                rows={10}
                className="mt-2 block w-full rounded-lg border-2 border-gray-600 shadow-sm 
                  focus:border-orange-500 focus:ring-2 focus:ring-orange-200 
                  hover:border-gray-500 transition-colors duration-200
                  text-base px-4 py-3 placeholder-gray-500 bg-gray-800 text-gray-300"
                value={jobDescText}
                onChange={(e) => setJobDescText(e.target.value.slice(0, 17000))}
                placeholder="Paste job description here..."
                maxLength={17000}
                required
              />
              <p className={`mt-1 text-xs text-right ${jobDescText.length > 15000 ? 'text-red-400' : 'text-gray-500'}`}>
                {jobDescText.length.toLocaleString()} / 17,000
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowJobDescForm(false)}
                className="inline-flex items-center px-3 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 transition-all duration-200"
              >
                Add
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Job Descriptions List - обновленный интерфейс */}
      <div className="space-y-6">
        {resume?.job_descriptions.map((jobDesc) => {
          const tunedResume = getTunedResumeForJobDesc(jobDesc.id);
          
          return (
            <div key={jobDesc.id} className={`
              bg-gray-900 shadow-md sm:rounded-lg mb-6 border border-gray-700 transition-all duration-300
              ${tunedResume?.status === 'completed' ? 'cursor-pointer hover:ring-2 hover:ring-orange-500' : ''}
              relative
            `}
              onClick={() => {
                if (tunedResume?.status === 'completed') {
                  handleSelectJobDesc(jobDesc);
                }
              }}
            >
              {/* Оверлей с текстом "Click for details" при наведении */}
              {tunedResume?.status === 'completed' && (
                <div className="absolute inset-0 bg-orange-500 bg-opacity-0 hover:bg-opacity-10 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 z-10">
                  <div className="bg-orange-600 text-white px-4 py-2 rounded-md shadow-lg">
                    Click for details
                  </div>
                </div>
              )}

              <div className="px-4 py-5 sm:p-6">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-white flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-gray-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0A2.18 2.18 0 0019.5 4.5h-15a2.18 2.18 0 00-.75 1.661V8.706c0 1.081.768 2.015 1.837 2.175a48.114 48.114 0 013.413.387m4.5-8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3A2.25 2.25 0 008.25 5.25v.878m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                      {jobDesc.title || `Job Description #${jobDesc.id}`}
                    </h3>
                  </div>
                  <div className="flex items-center space-x-3">
                    {tunedResume?.status === 'completed' && (
                      <div className="bg-green-900 text-green-300 text-xs font-medium px-2.5 py-1 rounded-full flex items-center border border-green-700">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3 mr-1">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Optimized
                      </div>
                    )}
                    
                    {/* Кнопки управления */}
                    <div className="flex space-x-2">
                      {(!tunedResume || tunedResume.status === 'failed') && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTuneResume(jobDesc.id);
                          }}
                          disabled={tuningInProgress}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all duration-200"
                        >
                          {tuningInProgress && tuningJobDescId === jobDesc.id ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Optimizing...
                            </>
                          ) : (
                            <>
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09zM15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                              </svg>
                              Start Optimization
                            </>
                          )}
                        </button>
                      )}
                      
                      {tunedResume?.status === 'in_progress' && (
                        <div className="flex items-center text-orange-400">
                          <svg className="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span className="font-medium">Optimization in progress...</span>
                        </div>
                      )}
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setJobDescToDelete(jobDesc.id);
                        }}
                        className="inline-flex items-center px-3 py-2 border border-red-600 text-sm font-medium rounded-md text-red-400 bg-gray-800 hover:bg-red-900/20 transition-colors duration-200"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              
                {/* Превью gap-анализа для завершённых оптимизаций */}
                {tunedResume?.status === 'completed' && tunedResume.gap_analysis_and_score && (
                  <div className="mt-4 p-3 bg-gray-800 rounded-md border border-gray-600">
                    <div className="flex items-center mb-1">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1.5 text-orange-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09zM15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                      </svg>
                      <span className="text-xs font-medium text-orange-400">AI Score &amp; Gap Analysis</span>
                    </div>
                    <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed">
                      {tunedResume.gap_analysis_and_score}
                    </p>
                    <p className="text-xs text-orange-500 mt-1">Click card to view full analysis →</p>
                  </div>
                )}
                
                {/* Отображение текста Job Description */}
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1 text-gray-400">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                    Job Description Text:
                    <button
                      onClick={() => toggleJobDescExpand(jobDesc.id)}
                      className="ml-auto flex items-center space-x-1 px-2 py-1 rounded-md bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors duration-200"
                    >
                      <span className="text-sm font-medium">
                        {expandedJobDescs.has(jobDesc.id) ? 'Hide' : 'Show'}
                      </span>
                      {expandedJobDescs.has(jobDesc.id) ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                      )}
                    </button>
                  </h4>
                  <div className="max-w-full text-sm text-gray-300">
                    <pre className={`whitespace-pre-wrap font-sans bg-gray-800 p-4 rounded-md border border-gray-600 text-gray-300 ${!expandedJobDescs.has(jobDesc.id) ? 'line-clamp-3' : ''}`}>
                      {jobDesc.description_text}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Job Description Delete Confirmation Modal */}
      {jobDescToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg shadow-xl max-w-md w-full p-6 border border-gray-700">
            <h3 className="text-lg font-medium text-white mb-4">Delete Confirmation</h3>
            <p className="text-sm text-gray-300 mb-4">
                      Are you sure you want to delete this job description? This action cannot be undone.
                    </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setJobDescToDelete(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800 border border-gray-600 rounded-md shadow-sm hover:bg-gray-700 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteJobDesc();
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 transition-colors duration-200"
              >
                Delete
              </button>
                  </div>
                </div>
              </div>
      )}

      {/* Resume Delete Confirmation Modal */}
      {showDeleteResumeConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg shadow-xl max-w-md w-full p-6 border border-gray-700">
            <h3 className="text-lg font-medium text-white mb-4">Delete Resume Confirmation</h3>
            <p className="text-sm text-gray-300 mb-4">
              Are you sure you want to delete this resume and all associated optimizations? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
                <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteResumeConfirm(false);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800 border border-gray-600 rounded-md shadow-sm hover:bg-gray-700 transition-colors duration-200"
                >
                Cancel
                </button>
                <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteResume();
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 transition-colors duration-200"
                >
                Delete
                </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно для отображения оптимизированного резюме */}
      {showModal && selectedTunedResume && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowModal(false);
            }
          }}
        >
          <div className="bg-gray-900 rounded-lg shadow-xl w-[90%] max-h-[90vh] flex flex-col border border-gray-700">
            <div className="p-4 border-b border-gray-700 flex flex-wrap justify-between items-center">
              <h3 className="text-lg font-medium text-white">
                Optimized resume for {selectedJobDesc?.title || 'selected job'}
              </h3>
              <div className="flex items-center space-x-2 flex-wrap">
                <div className="flex space-x-2 mr-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowOriginalResume(!showOriginalResume);
                    }}
                    className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-md border ${showOriginalResume ? 'bg-orange-900 text-orange-300 border-orange-700' : 'border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-orange-300'} transition-colors duration-200`}
                  >
                    {showOriginalResume ? 'Hide Original' : 'Show Original'}
                  </button>
                  
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowJobDescription(!showJobDescription);
                    }}
                    className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-md border ${showJobDescription ? 'bg-orange-900 text-orange-300 border-orange-700' : 'border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-orange-300'} transition-colors duration-200`}
                  >
                    {showJobDescription ? 'Hide Job Description' : 'Show Job Description'}
                  </button>
                  
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowOptimizedResume(!showOptimizedResume);
                    }}
                    className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-md border ${showOptimizedResume ? 'bg-orange-900 text-orange-300 border-orange-700' : 'border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-orange-300'} transition-colors duration-200`}
                  >
                    {showOptimizedResume ? 'Hide Optimized' : 'Show Optimized'}
                  </button>
                  
                  {/* Cover Letter */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTab(selectedTab === 'cover' ? 'resume' : 'cover');
                    }}
                    className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-md border ${selectedTab === 'cover' ? 'bg-green-900 text-green-300 border-green-700' : 'border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-green-300'} transition-colors duration-200`}
                  >
                    Cover Letter
                  </button>

                  {/* Gap Analysis */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTab(selectedTab === 'analysis' ? 'resume' : 'analysis');
                    }}
                    className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-md border ${selectedTab === 'analysis' ? 'bg-purple-900 text-purple-300 border-purple-700' : 'border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-purple-300'} transition-colors duration-200`}
                  >
                    AI Analysis
                  </button>
                </div>
                
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    selectedJobDesc && setJobDescToDelete(selectedJobDesc.id);
                    setShowModal(false);
                  }}
                  className="text-red-400 hover:text-red-300 flex items-center transition-colors duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  <span className="text-sm">Delete</span>
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowModal(false);
                  }}
                  className="text-gray-400 hover:text-gray-300 transition-colors duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                  </button>
              </div>
              </div>
              
            <div className="p-6 overflow-y-auto flex-1">
              {selectedTab === 'analysis' ? (
                // Вкладка с gap-анализом и score от AI
                <div className="bg-gray-800 border border-purple-700 rounded-md p-6 shadow-sm">
                  <div className="flex items-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-purple-400">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09zM15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                    </svg>
                    <span className="text-sm font-semibold text-purple-300">
                      AI Score &amp; Gap Analysis
                    </span>
                  </div>
                  {selectedTunedResume.gap_analysis_and_score ? (
                    <pre className="whitespace-pre-wrap font-sans text-sm text-gray-200 leading-relaxed">
                      {selectedTunedResume.gap_analysis_and_score}
                    </pre>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-gray-500 mb-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09z" />
                      </svg>
                      <h3 className="text-lg font-medium text-gray-300">Analysis not available</h3>
                      <p className="mt-2 text-sm text-gray-400 max-w-md">
                        Try re-optimizing the resume to generate a gap analysis.
                      </p>
                    </div>
                  )}
                </div>
              ) : selectedTab === 'resume' ? (
                // Трехколоночный вид для резюме
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Оригинальное резюме (левая колонка) */}
                  {showOriginalResume && (
                    <div className="bg-gray-800 border border-gray-600 rounded-md p-4 shadow-sm transition-all duration-300 flex flex-col">
                      <div className="mb-2 text-xs font-medium text-gray-400 flex justify-between items-center">
                        <span>Original resume:</span>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowOriginalResume(false);
                          }}
                          className="text-gray-500 hover:text-gray-400"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <pre className="whitespace-pre-wrap font-mono text-sm text-gray-300 leading-relaxed h-[60vh] overflow-y-auto flex-1">
                            {resume?.original_text}
                          </pre>
                        </div>
                  )}
                  
                  {/* Описание вакансии (центральная колонка) */}
                  {showJobDescription && (
                    <div className="bg-gray-800 border border-gray-600 rounded-md p-4 shadow-sm transition-all duration-300 flex flex-col">
                      <div className="mb-2 text-xs font-medium text-gray-400 flex justify-between items-center">
                        <span>Job Description:</span>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowJobDescription(false);
                          }}
                          className="text-gray-500 hover:text-gray-400"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                      </button>
                          </div>
                        <div className="mb-2 text-sm font-medium text-gray-300">
                          {selectedJobDesc?.title || 'Job title not specified'}
                            </div>
                        <pre className="whitespace-pre-wrap font-mono text-sm text-gray-300 leading-relaxed h-[60vh] overflow-y-auto flex-1">
                          {selectedJobDesc?.description_text || 'Job description missing'}
                            </pre>
                            </div>
                          )}
                  
                  {/* Оптимизированное резюме (правая колонка) */}
                  {showOptimizedResume && (
                    <div className="bg-gray-800 border border-gray-600 rounded-md p-4 shadow-sm transition-all duration-300 flex flex-col">
                      <div className="mb-2 text-xs font-medium text-gray-400 flex justify-between items-center">
                        <span>Optimized resume:</span>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowOptimizedResume(false);
                          }}
                          className="text-gray-500 hover:text-gray-400"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <pre className="whitespace-pre-wrap font-mono text-sm text-gray-300 leading-relaxed h-[60vh] overflow-y-auto flex-1">
                            {selectedTunedResume.tuned_text}
                          </pre>
                        </div>
                    )}
                  </div>
              ) : (
                  // Отображение сопроводительного письма
                  <div className="bg-gray-800 border border-gray-600 rounded-md p-4 shadow-sm">
                    <div className="mb-2 text-sm font-medium text-gray-300 flex justify-between items-center">
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-green-500">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                        </svg>
                        <span>Cover letter for {selectedJobDesc?.title || 'selected job'}</span>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTab('resume');
                        }}
                        className="text-gray-500 hover:text-gray-400"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15m0 0l6.75 6.75M4.5 12l6.75-6.75" />
                        </svg>
                      </button>
                    </div>
                    <div className="bg-gray-700 rounded-md p-6 border border-gray-600">
                      {selectedTunedResume.cover_letter ? (
                        <pre className="whitespace-pre-wrap font-sans text-sm text-gray-300 leading-relaxed">
                          {selectedTunedResume.cover_letter}
                        </pre>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-gray-500 mb-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                          </svg>
                          <h3 className="text-lg font-medium text-gray-300">Cover letter not generated</h3>
                          <p className="mt-2 text-sm text-gray-400 max-w-md">
                            A cover letter was not generated for this job. Try re-optimizing the resume.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
            <div className="p-4 border-t flex flex-wrap justify-between items-center">
              <div className="mb-3 md:mb-0"></div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); setShowModal(false); }}
                  className="px-4 py-2 border border-gray-600 rounded-md text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 transition-colors duration-200"
                >
                  Close
                </button>

                {selectedTab === 'resume' && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); selectedTunedResume.tuned_text && copyToClipboard(selectedTunedResume.tuned_text, 'resume'); }}
                      className="px-4 py-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-md text-sm font-medium hover:from-orange-600 hover:to-yellow-600 transition-all duration-200"
                      disabled={!selectedTunedResume.tuned_text}
                    >
                      Copy Resume
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); selectedTunedResume.tuned_text && downloadAsFile(selectedTunedResume.tuned_text, 'optimized_resume.txt'); }}
                      className="px-4 py-2 bg-gray-700 text-white rounded-md text-sm font-medium hover:bg-gray-600 transition-colors duration-200"
                      disabled={!selectedTunedResume.tuned_text}
                    >
                      Download Resume
                    </button>
                  </>
                )}

                {selectedTab === 'cover' && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); selectedTunedResume.cover_letter && copyToClipboard(selectedTunedResume.cover_letter, 'cover'); }}
                      className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors duration-200"
                      disabled={!selectedTunedResume.cover_letter}
                    >
                      Copy Letter
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); selectedTunedResume.cover_letter && downloadAsFile(selectedTunedResume.cover_letter, 'cover_letter.txt'); }}
                      className="px-4 py-2 bg-gray-700 text-white rounded-md text-sm font-medium hover:bg-gray-600 transition-colors duration-200"
                      disabled={!selectedTunedResume.cover_letter}
                    >
                      Download Letter
                    </button>
                  </>
                )}

                {selectedTab === 'analysis' && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); selectedTunedResume.gap_analysis_and_score && copyToClipboard(selectedTunedResume.gap_analysis_and_score, 'resume'); }}
                      className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 transition-colors duration-200"
                      disabled={!selectedTunedResume.gap_analysis_and_score}
                    >
                      Copy Analysis
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); selectedTunedResume.gap_analysis_and_score && downloadAsFile(selectedTunedResume.gap_analysis_and_score, 'gap_analysis.txt'); }}
                      className="px-4 py-2 bg-gray-700 text-white rounded-md text-sm font-medium hover:bg-gray-600 transition-colors duration-200"
                      disabled={!selectedTunedResume.gap_analysis_and_score}
                    >
                      Download Analysis
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 