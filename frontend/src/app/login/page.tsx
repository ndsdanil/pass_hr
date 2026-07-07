'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { motion } from 'framer-motion';
import { 
  LockClosedIcon, 
  ArrowRightIcon, 
  EnvelopeIcon, 
  SparklesIcon, 
  ExclamationCircleIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';

// Tech-inspired background component
const TechBackground = () => (
  <div className="absolute inset-0 -z-10 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900/30 to-black"></div>
    
    {/* Grid pattern */}
    <svg
      className="absolute left-[max(50%,25rem)] top-0 h-[64rem] w-[128rem] -translate-x-1/2 stroke-orange-500/20 [mask-image:radial-gradient(64rem_64rem_at_top,white,transparent)]"
      aria-hidden="true"
    >
      <defs>
        <pattern
          id="tech-grid"
          width={100}
          height={100}
          x="50%"
          y={-1}
          patternUnits="userSpaceOnUse"
        >
          <path d="M100 100V.5M.5 .5H100" fill="none" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" strokeWidth={0} fill="url(#tech-grid)" />
    </svg>
  </div>
);

// Circuit board pattern background
const CircuitPattern = () => (
  <div className="absolute inset-0 opacity-5 pointer-events-none">
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" className="text-orange-500">
      <pattern id="circuit-board" width="60" height="60" patternUnits="userSpaceOnUse">
        <path d="M36,0 L24,12 L12,24 L0,36" fill="none" stroke="currentColor" strokeWidth="0.5" />
        <rect width="4" height="4" x="32" y="28" fill="currentColor" />
        <rect width="4" height="4" x="16" y="16" fill="currentColor" />
        <circle cx="10" cy="46" r="2" fill="currentColor" />
        <circle cx="46" cy="10" r="2" fill="currentColor" />
      </pattern>
      <rect width="100%" height="100%" fill="url(#circuit-board)" />
    </svg>
  </div>
);

// Floating digital particles
const DigitalParticles = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {[...Array(15)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full bg-orange-500/20"
        style={{
          width: `${Math.random() * 6 + 2}px`,
          height: `${Math.random() * 6 + 2}px`,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
        }}
        animate={{
          opacity: [0.2, 0.8, 0.2],
          scale: [1, 1.5, 1],
          x: [0, Math.random() * 50 - 25, 0],
          y: [0, Math.random() * 50 - 25, 0]
        }}
        transition={{
          duration: Math.random() * 4 + 3,
          repeat: Infinity,
          delay: Math.random() * 2
        }}
      />
    ))}
  </div>
);

// Modern AI network node visualization
const AiNodeGraphic = () => (
  <div className="absolute right-0 -z-10 transform translate-x-1/3 opacity-60 select-none pointer-events-none hidden lg:block">
    <svg width="500" height="500" viewBox="0 0 100 100" className="text-orange-500/30">
      <defs>
        <linearGradient id="node-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(255, 144, 0, 0.2)" />
          <stop offset="100%" stopColor="rgba(255, 193, 7, 0.2)" />
        </linearGradient>
      </defs>
      
      {/* Central node */}
      <circle cx="50" cy="50" r="8" fill="url(#node-gradient)" stroke="currentColor" strokeWidth="0.5">
        <animate
          attributeName="r"
          values="8;9;8"
          dur="3s"
          repeatCount="indefinite"
        />
      </circle>
      
      {/* Orbital circles */}
      <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="0.3" strokeDasharray="2 2">
        <animate
          attributeName="r"
          values="20;21;20"
          dur="5s"
          repeatCount="indefinite"
        />
      </circle>
      
      <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="0.2" strokeDasharray="3 3">
        <animate
          attributeName="r"
          values="35;37;35"
          dur="7s"
          repeatCount="indefinite"
        />
      </circle>
      
      {/* Nodes */}
      {[...Array(8)].map((_, i) => (
        <g key={i}>
          <circle
            cx={50 + 20 * Math.cos((i * Math.PI) / 4)}
            cy={50 + 20 * Math.sin((i * Math.PI) / 4)}
            r="2"
            fill="url(#node-gradient)"
          >
            <animate
              attributeName="r"
              values="2;3;2"
              dur="3s"
              begin={`${i * 0.4}s`}
              repeatCount="indefinite"
            />
          </circle>
          
          {/* Connection lines */}
          <line 
            x1="50" 
            y1="50" 
            x2={50 + 20 * Math.cos((i * Math.PI) / 4)} 
            y2={50 + 20 * Math.sin((i * Math.PI) / 4)} 
            stroke="currentColor" 
            strokeWidth="0.3"
            strokeDasharray="1 1"
          >
            <animate
              attributeName="stroke-dasharray"
              values="1 2;1 1;1 2"
              dur="2s"
              begin={`${i * 0.3}s`}
              repeatCount="indefinite"
            />
          </line>
        </g>
      ))}
    </svg>
  </div>
);

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  // Используем Zustand хранилище для авторизации
  const { login, loading, error, clearError } = useAuthStore();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Очищаем сообщение об ошибке при вводе
    if (error) clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Используем метод login из хранилища
      await login(formData.email, formData.password);
      
      // Редирект на dashboard при успешном входе
      router.push('/dashboard');
    } catch (err) {
      // Ошибки обрабатываются внутри хранилища
      console.error('Login error:', err);
    }
  };

  return (
    <>
      <Header />
      <div className="relative isolate flex min-h-screen flex-1 flex-col justify-center px-6 py-12 lg:px-8 overflow-hidden bg-black">
        <TechBackground />
        <DigitalParticles />
        <CircuitPattern />
        <AiNodeGraphic />
        
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <motion.div 
            className="flex flex-col items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div 
              className="flex h-16 w-16 items-center justify-center rounded-full relative mb-6 mt-20"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500 via-yellow-500 to-yellow-300 opacity-20 blur"></div>
              <div className="relative bg-white rounded-full p-4">
                <UserCircleIcon className="h-8 w-8 text-orange-600" />
              </div>
            </motion.div>
            
            <motion.h2 
              className="text-center text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-orange-600 via-yellow-600 to-yellow-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              Sign in to your account
            </motion.h2>
            
            <motion.p 
              className="mt-2 text-center text-sm text-gray-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Access your AI-powered career platform
            </motion.p>
          </motion.div>
        </div>

        <motion.div 
          className="mt-10 sm:mx-auto sm:w-full sm:max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div className="relative bg-gray-900/80 backdrop-blur-sm px-6 py-8 shadow-xl ring-1 ring-gray-700/50 sm:rounded-xl sm:px-10 border border-gray-700">
            <div className="absolute -inset-px bg-gradient-to-r from-orange-500 via-yellow-500 to-yellow-300 rounded-xl opacity-10 blur-sm"></div>
            
            <form className="relative space-y-6" onSubmit={handleSubmit}>
              {error && (
                <motion.div 
                  className="rounded-lg bg-red-50 p-4 border border-red-200"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center">
                    <ExclamationCircleIcon className="h-5 w-5 text-red-500 mr-3" />
                    <div className="text-sm text-red-700">
                      {error}
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium leading-6 text-white">
                  Email
                </label>
                <div className="relative mt-2">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full rounded-lg border-0 py-2 pl-10 pr-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-orange-600 sm:text-sm sm:leading-6 transition-all duration-200"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-medium leading-6 text-white">
                    Password
                  </label>
                  <div className="text-sm">
                    <Link href="#" className="font-semibold text-orange-600 hover:text-orange-500 transition-colors duration-200">
                      Forgot password?
                    </Link>
                  </div>
                </div>
                <div className="relative mt-2">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <LockClosedIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full rounded-lg border-0 py-2 pl-10 pr-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-orange-600 sm:text-sm sm:leading-6 transition-all duration-200"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative flex w-full justify-center rounded-lg overflow-hidden border-0 bg-gradient-to-r from-orange-600 via-yellow-600 to-yellow-300 p-0.5 text-sm font-semibold text-white shadow-sm hover:shadow-md hover:shadow-orange-500/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 disabled:opacity-50 transition-all duration-200"
                >
                  <span className="flex w-full items-center justify-center gap-2 rounded-md bg-gradient-to-r from-orange-600 via-yellow-600 to-yellow-300 px-3 py-1.5 transition-all duration-200 group-hover:bg-none">
                    {loading ? 'Signing in...' : 'Sign in'}
                    {!loading && (
                      <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                    )}
                  </span>
                </button>
              </div>
            </form>
            
          </div>

          <p className="mt-8 text-center text-sm text-gray-300">
            Not registered yet?{' '}
            <Link href="/register" className="font-semibold text-orange-600 hover:text-orange-500 transition-colors duration-200 relative group">
              Create an account
              <span className="absolute bottom-0 left-0 h-0.5 w-full origin-left scale-x-0 transform bg-orange-600 transition-transform duration-300 group-hover:scale-x-100"></span>
            </Link>
          </p>
          
          <motion.div 
            className="mt-8 flex justify-center items-center gap-1 text-xs text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            <SparklesIcon className="h-3 w-3 text-orange-500" />
            <span>Powered by AI</span>
          </motion.div>
        </motion.div>
      </div>
      <Footer />
    </>
  );
} 