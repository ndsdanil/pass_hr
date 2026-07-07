'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { isAuthenticated, authApi, refreshAccessToken } from '@/app/lib/api';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Функция для проверки авторизации
    const checkAuth = async () => {
      try {
        // Сначала проверяем наличие признаков авторизации
        if (!isAuthenticated()) {
          // Пробуем обновить токен - может быть только cookie, без accessToken в памяти
          const refreshed = await refreshAccessToken();
          if (!refreshed) {
            router.push('/login');
            return;
          }
        }

        // Делаем запрос к защищенному API для проверки валидности токена
        await authApi.getCurrentUser();
        setIsAuthorized(true);
      } catch (error) {
        console.error('Ошибка авторизации:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Слушаем события изменения состояния авторизации
    const handleAuthChange = () => {
      checkAuth();
    };

    // Добавляем обработчик события авторизации
    window.addEventListener('auth-change', handleAuthChange);

    // Очистка при размонтировании компонента
    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
    };
  }, [router]);

  // Показываем загрузку, пока проверяем авторизацию
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Если пользователь авторизован, показываем содержимое
  return isAuthorized ? <>{children}</> : null;
} 