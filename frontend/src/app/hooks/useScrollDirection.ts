'use client';

import { useState, useEffect } from 'react';

type ScrollDirection = 'up' | 'down' | 'none';

export interface ScrollInfo {
  direction: ScrollDirection;
  scrollY: number;
  isAtTop: boolean;
}

/**
 * Hook для отслеживания направления и позиции скролла
 * @param threshold Минимальное расстояние скролла для определения направления
 * @param initialDirection Начальное направление скролла
 * @returns Объект с информацией о скролле {direction, scrollY, isAtTop}
 */
export function useScrollDirection(
  threshold = 10,
  initialDirection: ScrollDirection = 'none'
): ScrollInfo {
  const [scrollInfo, setScrollInfo] = useState<ScrollInfo>({
    direction: initialDirection,
    scrollY: 0,
    isAtTop: true
  });
  
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;
    
    const updateScrollInfo = () => {
      const scrollY = window.scrollY;
      const direction = scrollY === 0
        ? 'none'
        : scrollY > lastScrollY && Math.abs(scrollY - lastScrollY) > threshold
          ? 'down'
          : scrollY < lastScrollY && Math.abs(scrollY - lastScrollY) > threshold
            ? 'up'
            : scrollInfo.direction;
      
      const isAtTop = scrollY < 50;
      
      setScrollInfo({ direction, scrollY, isAtTop });
      lastScrollY = scrollY > 0 ? scrollY : 0;
      ticking = false;
    };
    
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollInfo);
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', onScroll);
    
    return () => window.removeEventListener('scroll', onScroll);
    
  }, [threshold, scrollInfo.direction]);
  
  return scrollInfo;
} 