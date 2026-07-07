import { create } from 'zustand';
import { getAccessToken, saveAccessToken, clearLocalTokens, authApi } from '@/app/lib/api';
import type { User } from '@/app/lib/api';

interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  user: User | null;
  loading: boolean;
  error: string | null;
  
  // Действия
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
  setUser: (user: User) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  accessToken: null,
  user: null,
  loading: false,
  error: null,
  
  // Инициализация при создании хранилища
  init: async () => {
    const token = getAccessToken();
    if (token) {
      set({ accessToken: token, isAuthenticated: true });
      await get().checkAuth();
    }
  },
  
  // Аутентификация пользователя
  login: async (email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      const response = await authApi.login(email, password);
      saveAccessToken(response.access_token);
      set({ 
        accessToken: response.access_token,
        isAuthenticated: true,
        loading: false
      });
      
      // Получаем данные пользователя
      await get().checkAuth();
    } catch (error) {
      set({ 
        loading: false, 
        error: error instanceof Error ? error.message : 'Ошибка входа в систему' 
      });
    }
  },
  
  // Выход из системы
  logout: async () => {
    set({ loading: true });
    try {
      await authApi.logout();
      set({ 
        isAuthenticated: false,
        accessToken: null,
        user: null,
        loading: false
      });
    } catch (error) {
      // Даже если запрос на сервер не удался, очищаем локальные данные
      clearLocalTokens();
      set({ 
        isAuthenticated: false,
        accessToken: null,
        user: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Ошибка выхода из системы' 
      });
    }
  },
  
  // Проверка авторизации и получение данных пользователя
  checkAuth: async () => {
    set({ loading: true, error: null });
    try {
      const user = await authApi.getCurrentUser();
      set({ user, loading: false, isAuthenticated: true });
      return true;
    } catch (error) {
      set({ 
        isAuthenticated: false,
        accessToken: null,
        user: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Ошибка авторизации'
      });
      return false;
    }
  },
  
  // Установка данных пользователя
  setUser: (user: User) => {
    set({ user });
  },
  
  // Очистка ошибок
  clearError: () => {
    set({ error: null });
  }
})); 