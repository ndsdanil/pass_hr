import axios from 'axios';
import { getAccessToken, saveAccessToken, removeTokens } from '@/app/lib/api';

// Определяем базовый URL в зависимости от окружения и переменных
const determineApiUrl = (): string => {
  // Для серверного рендеринга
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || '/api/v1';
  }
  
  // Для клиентского рендеринга - проверяем переменные окружения
  const environment = process.env.ENVIRONMENT || 'development';
  const configuredUrl = process.env.NEXT_PUBLIC_API_URL;
  
  // Если указан URL в переменных окружения, используем его
  if (configuredUrl) {
    return configuredUrl;
  }
  
  // Если запущено в production, используем относительный путь
  if (environment === 'production') {
    return '/api/v1';
  }
  
  // Для локальной разработки используем localhost
  return 'http://localhost:8000/api/v1';
};

// Определяем базовый URL для API
const API_URL = determineApiUrl();
console.log('Using API URL:', API_URL);

// Создаем экземпляр axios с настройками
export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Важно для работы с cookies
  xsrfCookieName: 'csrf_token',
  xsrfHeaderName: 'X-CSRF-TOKEN'
});

// Функция для исправления URL, заменяющая hardcoded localhost URL на относительные
const fixApiUrl = (url: string): string => {
  if (!url) return url;
  
  // В режиме разработки не меняем localhost URL
  if (process.env.ENVIRONMENT === 'development' && url.includes('localhost:8000')) {
    return url;
  }
  
  // Список возможных паттернов для замены
  const patterns = [
    'http://localhost:8000/api/v1',
    'https://localhost:8000/api/v1',
    'http://localhost:8000',
    'https://localhost:8000',
    'http://backend:8000/api/v1',
    'https://backend:8000/api/v1',
    'http://backend:8000',
    'https://backend:8000'
  ];
  
  let newUrl = url;
  
  // Заменяем все найденные паттерны
  for (const pattern of patterns) {
    if (newUrl.includes(pattern)) {
      // Если URL содержит /api/v1 дважды, удаляем один из них
      if (pattern.includes('/api/v1')) {
        newUrl = newUrl.replace(pattern, '');
      } else {
        newUrl = newUrl.replace(pattern, '/api/v1');
      }
      // console.warn(`Fixed API URL: ${url} -> ${newUrl}`);
      break;
    }
  }
  
  // В production режиме удаляем префикс /api/v1 для избежания дублирования
  if (process.env.ENVIRONMENT === 'production' && newUrl.startsWith('/api/v1')) {
    newUrl = newUrl.substring('/api/v1'.length);
    // console.warn(`Removed /api/v1 prefix from URL: ${url} -> ${newUrl}`);
  }
  
  return newUrl;
};

// Перехватчик запросов - добавляем токен и исправляем URL при необходимости
apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Исправляем URL, если он указывает на localhost или другие hardcoded адреса
    if (config.url) {
      config.url = fixApiUrl(config.url);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Добавляем интерцептор для обработки ошибок и обновления токена
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Если ошибка 401 и это не запрос на обновление токена и не повторный запрос
    if (error.response?.status === 401 && !originalRequest._retry && 
        !originalRequest.url?.includes('/auth/refresh')) {
      originalRequest._retry = true;

      try {
        // Пытаемся обновить токен через cookie
        const response = await axios.post(`${API_URL}/auth/refresh`, {}, {
          withCredentials: true // Важно для получения cookies
        });

        // Сохраняем только access token
        const { access_token } = response.data;
        saveAccessToken(access_token);

        // Повторяем оригинальный запрос с новым токеном
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Если не удалось обновить токен, очищаем данные и перенаправляем на страницу входа
        await removeTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient; 