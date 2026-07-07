'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useMediaQuery } from '@/app/hooks/useMediaQuery';

// Background component with pattern
const BackgroundGraphic = () => (
  <div className="absolute inset-0 -z-10 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
    
    {/* Grid pattern */}
    <svg
      className="absolute left-[max(50%,25rem)] top-0 h-[64rem] w-[128rem] -translate-x-1/2 stroke-orange-500/20 [mask-image:radial-gradient(64rem_64rem_at_top,white,transparent)]"
      aria-hidden="true"
    >
      <defs>
        <pattern
          id="e813992c-7d03-4cc4-a2bd-151760b470a0"
          width={200}
          height={200}
          x="50%"
          y={-1}
          patternUnits="userSpaceOnUse"
        >
          <path d="M.5 200V.5H200" fill="none" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" strokeWidth={0} fill="url(#e813992c-7d03-4cc4-a2bd-151760b470a0)" />
    </svg>
    
    {/* Decorative elements */}
    <div className="absolute inset-x-0 top-28 -z-10 transform-gpu overflow-hidden blur-3xl" aria-hidden="true">
      <div
        className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-orange-500 to-yellow-500 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
        style={{
          clipPath:
            'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
        }}
      />
    </div>
  </div>
);

// Modern AI network node visualization
const AiGraphic = () => (
  <div className="absolute right-0 top-0 -z-10 transform translate-x-1/3 opacity-70 select-none pointer-events-none hidden md:block">
    <svg width="400" height="400" viewBox="0 0 100 100" className="text-orange-500/30">
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
          
          {/* Outer nodes */}
          {i % 2 === 0 && (
            <g>
              <circle
                cx={50 + 35 * Math.cos((i * Math.PI) / 4)}
                cy={50 + 35 * Math.sin((i * Math.PI) / 4)}
                r="1.5"
                fill="url(#node-gradient)"
              >
                <animate
                  attributeName="r"
                  values="1.5;2;1.5"
                  dur="4s"
                  begin={`${i * 0.5}s`}
                  repeatCount="indefinite"
                />
              </circle>
              
              {/* Connection to middle node */}
              <line 
                x1={50 + 20 * Math.cos((i * Math.PI) / 4)} 
                y1={50 + 20 * Math.sin((i * Math.PI) / 4)} 
                x2={50 + 35 * Math.cos((i * Math.PI) / 4)} 
                y2={50 + 35 * Math.sin((i * Math.PI) / 4)} 
                stroke="currentColor" 
                strokeWidth="0.2"
                strokeDasharray="1 2"
              />
            </g>
          )}
        </g>
      ))}
    </svg>
  </div>
);

// Simplified mobile AI graphic
const MobileAiGraphic = () => (
  <div className="absolute right-0 -top-10 -z-10 transform translate-x-1/4 opacity-70 select-none pointer-events-none md:hidden">
    <svg width="200" height="200" viewBox="0 0 100 100" className="text-orange-500/30">
      <defs>
        <linearGradient id="mobile-node-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(255, 144, 0, 0.2)" />
          <stop offset="100%" stopColor="rgba(255, 193, 7, 0.2)" />
        </linearGradient>
      </defs>
      
      <circle cx="50" cy="50" r="8" fill="url(#mobile-node-gradient)" stroke="currentColor" strokeWidth="0.5" />
      <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="0.3" strokeDasharray="2 2" />
      
      {[...Array(4)].map((_, i) => (
        <g key={i}>
          <circle
            cx={50 + 20 * Math.cos((i * Math.PI) / 2)}
            cy={50 + 20 * Math.sin((i * Math.PI) / 2)}
            r="2"
            fill="url(#mobile-node-gradient)"
          />
          <line 
            x1="50" 
            y1="50" 
            x2={50 + 20 * Math.cos((i * Math.PI) / 2)} 
            y2={50 + 20 * Math.sin((i * Math.PI) / 2)} 
            stroke="currentColor" 
            strokeWidth="0.3"
          />
        </g>
      ))}
    </svg>
  </div>
);

// Floating code blocks for tech aesthetic
const CodeBlocks = () => {
  const codeSnippets = [
    { text: 'AI.optimize(resume)', opacity: 0.7, delay: 0 },
    { text: 'await Interview.prepare()', opacity: 0.5, delay: 0.4 },
    { text: 'JobSearch.autoApply()', opacity: 0.6, delay: 0.8 }
  ];
  
  return (
    <div className="absolute -z-10 top-20 left-10 opacity-30 hidden lg:block">
      {codeSnippets.map((snippet, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: snippet.opacity, y: 0 }}
          transition={{ duration: 0.8, delay: snippet.delay }}
          className="font-mono text-xs text-orange-300 bg-black/40 backdrop-blur-sm p-2 rounded-md mb-2 border border-orange-500/20"
        >
          {snippet.text}
        </motion.div>
      ))}
    </div>
  );
};

export default function Hero() {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <div className="relative isolate overflow-hidden">
      <BackgroundGraphic />
      <AiGraphic />
      <MobileAiGraphic />
      <CodeBlocks />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pb-16 pt-24 sm:pb-24 sm:pt-32 lg:px-8 lg:pt-40">
        <div className="mx-auto max-w-2xl gap-x-14 lg:mx-0 lg:flex lg:max-w-none lg:items-center">
          <motion.div 
            className="relative z-10 w-full max-w-xl lg:shrink-0 xl:max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            
            <motion.h1 
              className="text-3xl sm:text-4xl font-bold tracking-tight text-white sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-600"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              AI-Powered Career Platform
            </motion.h1>
            
            <motion.p 
              className="relative mt-4 sm:mt-6 text-base sm:text-lg leading-7 sm:leading-8 text-gray-300 sm:max-w-md lg:max-w-none"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              Advanced AI-powered solutions for job seekers. Streamline your job search with our intelligent tools and land your dream job faster than ever.
            </motion.p>
            
            <motion.div 
              className="mt-6 sm:mt-10 flex flex-col sm:flex-row items-center gap-4 sm:gap-x-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Link
                href="/register"
                className="w-full sm:w-auto group relative rounded-full bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-600 px-4 sm:px-6 py-2.5 sm:py-3 text-sm font-medium text-black shadow-md hover:shadow-lg hover:shadow-orange-500/30 transition-all duration-300"
              >
                Get Started
                <span className="absolute -right-1 top-1/2 flex h-3 w-3 -translate-y-1/2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-300 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-400"></span>
                </span>
              </Link>
              
              <Link 
                href="#how-it-works" 
                className="w-full sm:w-auto text-sm font-medium leading-6 text-gray-300 hover:text-orange-400 transition-colors group text-center relative overflow-hidden"
              >
                How it Works 
                <span className="absolute bottom-0 left-0 h-0.5 w-full origin-left scale-x-0 transform bg-orange-400 transition-transform duration-300 group-hover:scale-x-100"></span>
                <span aria-hidden="true" className="inline-block transition-transform group-hover:translate-x-1 ml-1">→</span>
              </Link>
            </motion.div>
            
            <motion.div 
              className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-2 sm:gap-x-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div 
                    key={i} 
                    className="relative inline-block h-8 w-8 rounded-full ring-2 ring-white overflow-hidden"
                    style={{
                      background: `linear-gradient(140deg, rgb(${255 - i * 10}, ${144 + i * 10}, ${0 + i * 5}), rgb(${255 - i * 15}, ${193 + i * 5}, ${7 + i * 8}))`
                    }}
                  >
                    <span className="absolute inset-0 bg-black/5"></span>
                  </div>
                ))}
              </div>
              <span className="text-xs sm:text-sm text-gray-400 text-center sm:text-left">Join 1000+ professionals who improved their job search</span>
            </motion.div>
          </motion.div>
          
          {!isMobile && (
            <motion.div
              className="mt-14 flex justify-end gap-8 sm:-mt-44 sm:justify-start sm:pl-20 lg:mt-0 lg:pl-0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <div className="relative w-96 h-96">
                <svg viewBox="0 0 200 200" className="absolute w-full h-full">
                  <defs>
                    <linearGradient id="hero-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="rgba(255, 144, 0, 0.3)" />
                      <stop offset="50%" stopColor="rgba(255, 193, 7, 0.2)" />
                      <stop offset="100%" stopColor="rgba(255, 165, 0, 0.3)" />
                    </linearGradient>
                  </defs>
                  <path
                    fill="url(#hero-gradient)"
                    d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.5,90,-16.3,88.5,-1.5C87,13.3,81.4,26.5,73.6,38.2C65.8,49.9,55.7,60,43.3,67.7C30.9,75.4,16.2,80.7,0.7,79.7C-14.8,78.7,-29.6,71.4,-43.9,63.5C-58.2,55.7,-72,47.3,-79.1,34.9C-86.2,22.4,-86.7,5.9,-83.2,-9.2C-79.7,-24.3,-72.2,-38,-61.9,-47.4C-51.6,-56.8,-38.5,-61.9,-26.1,-70.4C-13.7,-78.9,-2.1,-90.8,8.9,-104.8C19.9,-118.8,39.8,-134.9,44.7,-76.4Z"
                    transform="translate(100 100)"
                  >
                    <animateTransform
                      attributeName="transform"
                      type="rotate"
                      from="0 100 100"
                      to="360 100 100"
                      dur="60s"
                      repeatCount="indefinite"
                    />
                  </path>
                </svg>
                
                {/* Digital particles */}
                {[...Array(20)].map((_, i) => (
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
                      scale: [1, 1.5, 1]
                    }}
                    transition={{
                      duration: Math.random() * 4 + 2,
                      repeat: Infinity,
                      delay: Math.random() * 5
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
} 