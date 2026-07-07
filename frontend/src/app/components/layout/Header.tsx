'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Dialog } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '@/store/authStore';
import { useScrollDirection } from '@/app/hooks/useScrollDirection';
import { motion } from 'framer-motion';

const navigation = [
  { name: 'For Applicants', href: '/applicants' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contacts' },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { direction, isAtTop } = useScrollDirection();
  const [scrollProgress, setScrollProgress] = useState(0);
  
  // Используем Zustand store вместо локального состояния
  const { isAuthenticated, logout } = useAuthStore();
  
  // Определяем, должна ли шапка быть видимой
  const isVisible = direction === 'up' || isAtTop || mobileMenuOpen;
  
  // Определяем, должна ли шапка быть компактной
  const isCompact = !isAtTop && direction === 'up';

  useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        const progress = Math.min(window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100, 100);
        setScrollProgress(progress);
      }
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', handleScroll);
      handleScroll(); // Инициализация при монтировании
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  // Обработчик выхода из системы
  const handleLogout = async () => {
    await logout();
    router.push('/login'); 
  };

  // Функция для проверки активного состояния ссылки
  const isActive = (href: string) => {
    if (href.includes('#')) {
      return pathname === href.split('#')[0];
    }
    return pathname === href;
  };

  return (
    <>
      {isVisible && (
        <header 
          className={`fixed w-full bg-black/95 backdrop-blur-md z-50 shadow-sm border-b border-gray-800`}
        >
          {/* Индикатор прогресса */}
          {!isAtTop && (
            <motion.div 
              className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-orange-500 to-yellow-500"
              style={{ width: `${scrollProgress}%` }}
              initial={{ width: 0 }}
              animate={{ width: `${scrollProgress}%` }}
              transition={{ duration: 0.1 }}
            />
          )}
          
          <nav 
            className={`mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8 transition-all duration-300 ${
              isCompact ? 'py-2' : 'py-6'
            }`} 
            aria-label="Global"
          >
            <div className="flex lg:flex-1">
              <Link href="/" className="-m-1.5 p-1.5">
                <span className={`font-bold bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent transition-all duration-300 ${
                  isCompact ? 'text-xl' : 'text-2xl'
                }`}>
                  Pass.hr
                </span>
              </Link>
            </div>
            
            {/* Mobile menu button */}
            <div className="flex lg:hidden">
              <button
                type="button"
                className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
                onClick={() => setMobileMenuOpen(true)}
              >
                <span className="sr-only">Open main menu</span>
                <Bars3Icon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>

            {/* Desktop navigation */}
            <div className="hidden lg:flex lg:gap-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative text-sm font-semibold leading-6 transition-colors duration-200
                    ${isActive(item.href) 
                      ? 'text-orange-400' 
                      : 'text-gray-300 hover:text-orange-400'
                    }
                    ${isActive(item.href) && 'after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-0.5 after:bg-orange-400'}
                  `}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Desktop sign in/out buttons */}
            <div className="hidden lg:flex lg:flex-1 lg:justify-end">
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <Link
                    href="/dashboard"
                    className="text-sm font-semibold leading-6 text-gray-300 hover:text-orange-400 transition-colors duration-200"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-sm font-semibold leading-6 text-gray-300 hover:text-orange-400 transition-colors duration-200"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className={`text-sm font-semibold leading-6 px-6 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 text-black hover:from-orange-600 hover:to-yellow-600 transition-all duration-200 ${
                    isCompact ? 'py-1.5' : 'py-2'
                  }`}
                >
                  Sign In
                </Link>
              )}
            </div>

            {/* Mobile menu */}
            <Dialog as="div" className="lg:hidden" open={mobileMenuOpen} onClose={setMobileMenuOpen}>
              <div className="fixed inset-0 z-50" />
              <Dialog.Panel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-black px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-700">
                <div className="flex items-center justify-between">
                  <Link href="/" className="-m-1.5 p-1.5" onClick={() => setMobileMenuOpen(false)}>
                    <span className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
                      Pass.hr
                    </span>
                  </Link>
                  <button
                    type="button"
                    className="-m-2.5 rounded-md p-2.5 text-gray-300"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="sr-only">Close menu</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div className="mt-6 flow-root">
                  <div className="-my-6 divide-y divide-gray-700">
                    <div className="space-y-2 py-6">
                      {navigation.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={`-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 ${
                            isActive(item.href)
                              ? 'text-orange-400 bg-gray-800'
                              : 'text-gray-300 hover:bg-gray-800 hover:text-orange-400'
                          }`}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                    <div className="py-6 space-y-3">
                      {isAuthenticated ? (
                        <>
                          <Link
                            href="/dashboard"
                            className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-300 hover:bg-gray-800 hover:text-orange-400"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            Dashboard
                          </Link>
                          <button
                            onClick={() => {
                              handleLogout();
                              setMobileMenuOpen(false);
                            }}
                            className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-300 hover:bg-gray-800 hover:text-orange-400 w-full text-left"
                          >
                            Sign Out
                          </button>
                        </>
                      ) : (
                        <Link
                          href="/login"
                          className="block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-black bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-center"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Sign In
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Dialog>
          </nav>
        </header>
      )}
    </>
  );
} 