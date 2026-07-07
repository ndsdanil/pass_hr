'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { getAccessToken } from '@/app/lib/api';

interface AuthProviderProps {
  children: React.ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const { checkAuth, isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Инициализируем состояние аутентификации при загрузке приложения
    const initAuth = async () => {
      const token = getAccessToken();
      if (token && !isAuthenticated) {
        // Если есть токен, но состояние не инициализировано, проверяем его валидность
        await checkAuth();
      }
    };

    initAuth();
  }, [checkAuth, isAuthenticated]);

  return <>{children}</>;
} 