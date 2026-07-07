'use client';

import { useState, useEffect } from 'react';

/**
 * Hook для проверки соответствия медиа-запросу
 * @param query Медиа-запрос для проверки, например '(max-width: 768px)'
 * @returns Boolean значение, соответствует ли текущий размер экрана запросу
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  
  useEffect(() => {
    // На сервере и во время первого рендеринга на клиенте window может быть undefined
    if (typeof window === 'undefined') {
      return;
    }
    
    const media = window.matchMedia(query);
    
    // Установка начального значения
    setMatches(media.matches);
    
    // Функция обратного вызова для обновления состояния
    const updateMatches = () => {
      setMatches(media.matches);
    };
    
    // Добавление слушателя
    if (media.addEventListener) {
      media.addEventListener('change', updateMatches);
      return () => media.removeEventListener('change', updateMatches);
    } else {
      // Для поддержки старых браузеров
      media.addListener(updateMatches);
      return () => media.removeListener(updateMatches);
    }
  }, [query]);
  
  return matches;
} 