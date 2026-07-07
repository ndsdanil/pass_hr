// Базовый URL API
const API_BASE_URL = '/api/v1';

// Импортируем apiClient из единого источника
import apiClient from '@/api/client';

// Типы данных
export interface User {
  id: number;
  email: string;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface UserProfile {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  password_confirm: string;
  first_name?: string;
  last_name?: string;
  invite_code?: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token?: string; // Опционально, т.к. теперь refresh токен в HttpOnly cookie
  token_type: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface Subscription {
  id: number;
  plan_name: string;
  tokens_balance: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}

// Типы для резюме и вакансий
export interface Resume {
  id: number;
  original_text: string;
  user_id: number;
  created_at: string;
  updated_at: string | null;
}

export interface ResumeCreate {
  original_text: string;
}

export interface JobDescription {
  id: number;
  description_text: string;
  resume_id: number;
  created_at: string;
  updated_at: string | null;
}

export interface JobDescriptionCreate {
  description_text: string;
}

export type TuningStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

export interface TunedResume {
  id: number;
  resume_id: number;
  job_description_id: number;
  tuned_text: string | null;
  cover_letter: string | null;
  status: TuningStatus;
  error_message: string | null;
  created_at: string;
  updated_at: string | null;
  tokens_used?: number;
  metadata?: string;
}

export interface TunedResumeCreate {
  job_description_id: number;
}

export interface ResumeWithDescriptions {
  id: number;
  original_text: string;
  user_id: number;
  created_at: string;
  updated_at: string | null;
  job_descriptions: JobDescription[];
  tuned_resumes: TunedResume[];
}

export interface ResumeStats {
  resumes_count: number;
  job_descriptions_count: number;
  tuned_resumes_count: number;
}

export interface TuneResumeRequest {
  resume_id: number;
  job_description_id: number;
}

export interface OptimizedResume {
  optimized_resume: string;
  tuned_resume_id: number;
  missing_keywords: {
    skills: string[];
    experience: string[];
  };
  languages: {
    job_language: string;
    original_resume_language: string;
  };
  final_metrics: {
    skills_similarity: number;
    experience_similarity: number;
    text_similarity: number;
    skills_section_similarity: number;
    experience_section_similarity: number;
  };
}

// Функция для получения access токена из localStorage
export const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  return window.localStorage.getItem('access_token');
};

// Функция для сохранения access токена в localStorage
export const saveAccessToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('access_token', token);
    window.localStorage.setItem('isLoggedIn', 'true');
    // Генерируем событие для обновления UI
    window.dispatchEvent(new Event('auth-change'));
  }
};

// Функция для очистки только локальных токенов без запроса на сервер
export const clearLocalTokens = (): void => {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem('access_token');
    window.localStorage.removeItem('isLoggedIn');
    // Генерируем событие для обновления UI
    window.dispatchEvent(new Event('auth-change'));
  }
};

// Функция для удаления tokens
export const removeTokens = async (): Promise<void> => {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem('access_token');
    window.localStorage.removeItem('isLoggedIn');
    // Генерируем событие для обновления UI
    window.dispatchEvent(new Event('auth-change'));
    // Делаем запрос на logout для очистки cookie на сервере
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Ошибка при выходе из системы:', error);
    }
  }
};

// Базовая функция для выполнения запросов к API
const fetchApi = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  try {
    // Удаляем дублирование префикса /api/v1
    let cleanEndpoint = endpoint;
    if (endpoint.startsWith('/api/v1')) {
      cleanEndpoint = endpoint.replace('/api/v1', '');
      // console.warn(`Removed /api/v1 prefix from endpoint: ${endpoint} -> ${cleanEndpoint}`);
    }
    
    // Преобразуем из fetch-формата в axios-формат
    const axiosOptions: any = {
      url: cleanEndpoint,
      method: options.method || 'GET',
    };

    // Обрабатываем тело запроса
    if (options.body) {
      axiosOptions.data = typeof options.body === 'string' 
        ? JSON.parse(options.body) 
        : options.body;
    }
    
    // Обрабатываем заголовки
    if (options.headers) {
      axiosOptions.headers = options.headers;
    }

    const response = await apiClient.request(axiosOptions);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      await removeTokens();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    throw error.response?.data || error;
  }
};

// Функция для обновления токена доступа
export const refreshAccessToken = async (): Promise<boolean> => {
  try {
    const response = await apiClient.post('/auth/refresh');
    const data: TokenResponse = response.data;
    saveAccessToken(data.access_token);
    return true;
  } catch (error) {
    await removeTokens();
    return false;
  }
};

// API для аутентификации
export const authApi = {
  // Регистрация нового пользователя
  register: async (data: RegisterData): Promise<User> => {
    return fetchApi<User>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  // Вход в аккаунт
  login: async (email: string, password: string): Promise<TokenResponse> => {
    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);
      
      const response = await apiClient.post('/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      
      const tokens: TokenResponse = response.data;
      saveAccessToken(tokens.access_token);
      return tokens;
    } catch (error: any) {
      throw error.response?.data?.detail || error.message || 'Login error';
    }
  },
  
  // Выход из аккаунта
  logout: async (): Promise<void> => {
    try {
      // Сначала делаем запрос на сервер для очистки cookie
      await apiClient.post('/auth/logout');
    } catch (error) {
      // Игнорируем ошибки сервера при logout
      console.error('Server logout error:', error);
    } finally {
      // В любом случае очищаем локальные токены (без дополнительного запроса на сервер)
      clearLocalTokens();
    }
  },
  
  // Получение данных текущего пользователя
  getCurrentUser: async (): Promise<User> => {
    return fetchApi<User>('/auth/me');
  },
  
  // Получение профиля пользователя
  getUserProfile: async (): Promise<UserProfile> => {
    return await fetchApi<UserProfile>('/auth/me');
  },
  
  // Обновление профиля пользователя
  updateUserProfile: async (data: Partial<UserProfile>): Promise<UserProfile> => {
    return fetchApi<UserProfile>('/auth/me', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  },
};

// API для работы с подписками
export const subscriptionApi = {
  // Получение текущей подписки пользователя
  getCurrentSubscription: async (): Promise<Subscription> => {
    return fetchApi<Subscription>('/billing/subscription');
  },
  
  // Получение доступных планов подписки
  getPlans: async (): Promise<any[]> => {
    return fetchApi<any[]>('/billing/plans');
  },
  
  // Подписка на план
  subscribe: async (planName: string): Promise<Subscription> => {
    return fetchApi<Subscription>(`/billing/subscribe/${planName}`, {
      method: 'POST',
    });
  },
};

// API для работы с резюме
export const resumeApi = {
  // Получение списка резюме пользователя
  getResumes: async (): Promise<Resume[]> => {
    return fetchApi<Resume[]>('/resume/');
  },
  
  // Создание нового резюме
  createResume: async (data: ResumeCreate): Promise<Resume> => {
    return fetchApi<Resume>('/resume/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  // Получение резюме с описаниями вакансий и результатами тюнинга
  getResumeWithDescriptions: async (resumeId: number): Promise<ResumeWithDescriptions> => {
    return fetchApi<ResumeWithDescriptions>(`/resume/${resumeId}`);
  },
  
  // Добавление описания вакансии к резюме
  addJobDescription: async (resumeId: number, data: JobDescriptionCreate): Promise<JobDescription> => {
    return fetchApi<JobDescription>(`/resume/${resumeId}/job-descriptions`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  // Запуск процесса тюнинга резюме под конкретную вакансию
  startTuning: async (resumeId: number, data: TunedResumeCreate): Promise<TunedResume> => {
    return fetchApi<TunedResume>(`/resume/${resumeId}/tune`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  // Получение статуса и результата тюнинга резюме
  getTuningStatus: async (tunedResumeId: number): Promise<TunedResume> => {
    return fetchApi<TunedResume>(`/resume/tuning/${tunedResumeId}`);
  },
  
  // Получение статистики
  getStats: async (): Promise<ResumeStats> => {
    // Получаем список всех резюме пользователя
    const resumes = await fetchApi<ResumeWithDescriptions[]>('/resume/');
    
    // Собираем статистику по загруженным резюме
    let jobDescriptionsCount = 0;
    let tunedResumesCount = 0;
    
    // Для каждого резюме считаем количество описаний вакансий и оптимизированных резюме
    if (resumes && resumes.length > 0) {
      for (const resume of resumes) {
        // Если у резюме есть jobDescriptions, считаем их
        if (resume.job_descriptions) {
          jobDescriptionsCount += resume.job_descriptions.length;
        }
        
        // Если у резюме есть tunedResumes, считаем их
        if (resume.tuned_resumes) {
          tunedResumesCount += resume.tuned_resumes.length;
        }
      }
    }
    
    // Возвращаем собранную статистику
    return {
      resumes_count: resumes ? resumes.length : 0,
      job_descriptions_count: jobDescriptionsCount,
      tuned_resumes_count: tunedResumesCount
    };
  },

  /**
   * Оптимизирует резюме с помощью resume-tuner
   * @param data Данные для оптимизации
   */
  async optimizeWithTuner(data: TuneResumeRequest): Promise<OptimizedResume> {
    try {
      const response = await fetchApi<OptimizedResume>(`/resume/optimize-with-tuner`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response;
    } catch (error) {
      throw error;
    }
  },
};

// Проверка авторизации пользователя
export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  return !!getAccessToken() || window.localStorage.getItem('isLoggedIn') === 'true';
}; 