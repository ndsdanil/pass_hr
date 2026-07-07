'use client';

import { useInView } from 'react-intersection-observer';
import Link from 'next/link';
import { 
  DocumentTextIcon,
  RocketLaunchIcon,
  ChatBubbleBottomCenterTextIcon,
  ArrowPathIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  PresentationChartLineIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { Section, SectionTitle } from "@/components/ui/section";
import { StepCard } from "@/components/ui/step-card";
import { StepGrid } from "@/components/ui/step-grid";
import { Button } from "@/components/ui/button";
import { useMediaQuery } from '@/app/hooks/useMediaQuery';
import { motion } from 'framer-motion';

// Data for steps is separated from the component for cleaner code
const jobSeekerSteps = [
  {
    name: 'Upload Your Resume',
    description: 'AI analyzes and identifies areas for improvement',
    icon: DocumentTextIcon,
    color: 'from-orange-500 to-yellow-500'
  },
  {
    name: 'Add Job Description',
    description: 'System analyzes requirements and compares with your resume',
    icon: MagnifyingGlassIcon,
    color: 'from-orange-600 to-yellow-600'
  },
  {
    name: 'AI Optimizes Resume',
    description: 'Automatic optimization for ATS filters and keywords',
    icon: SparklesIcon,
    color: 'from-yellow-500 to-orange-500'
  },
  {
    name: 'Auto Job Application',
    description: 'AI automatically sends your optimized resume to relevant positions',
    icon: RocketLaunchIcon,
    color: 'from-yellow-600 to-orange-600'
  },
  {
    name: 'Interview Preparation',
    description: 'Get ready for interviews with AI assistance',
    icon: ChatBubbleBottomCenterTextIcon,
    color: 'from-orange-500 to-yellow-400'
  },
  {
    name: 'AI Interview Assistant',
    description: 'Real-time help during your interview',
    icon: UserGroupIcon,
    color: 'from-yellow-500 to-orange-400'
  }
];

// Tech-inspired background component
const TechBackground = () => (
  <div className="absolute inset-0 -z-10 overflow-hidden opacity-10">
    <div className="absolute right-0 top-0 -z-10 transform translate-x-1/3 opacity-70 pointer-events-none">
      <svg width="800" height="800" viewBox="0 0 200 200" className="text-orange-500">
        <defs>
          <linearGradient id="tech-bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgb(255, 144, 0)" />
            <stop offset="100%" stopColor="rgb(255, 193, 7)" />
          </linearGradient>
        </defs>
        <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="0.3" strokeDasharray="1 4" />
        <circle cx="100" cy="100" r="60" fill="none" stroke="currentColor" strokeWidth="0.3" strokeDasharray="1 6" />
        <circle cx="100" cy="100" r="40" fill="none" stroke="currentColor" strokeWidth="0.3" strokeDasharray="1 8" />
        
        <path 
          d="M160,100 C160,132.5 132.5,160 100,160 C67.5,160 40,132.5 40,100 C40,67.5 67.5,40 100,40 C132.5,40 160,67.5 160,100 Z" 
          fill="none" 
          stroke="url(#tech-bg-gradient)" 
          strokeWidth="0.5"
          strokeDasharray="3 3"
        />
        
        {/* Circuit-like lines */}
        <path 
          d="M100,20 L100,40 M100,160 L100,180 M20,100 L40,100 M160,100 L180,100"
          stroke="currentColor"
          strokeWidth="0.5"
        />
        
        {/* Connection points */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
          const radian = angle * Math.PI / 180;
          const x = 100 + 80 * Math.cos(radian);
          const y = 100 + 80 * Math.sin(radian);
          return (
            <circle 
              key={i} 
              cx={x} 
              cy={y} 
              r="1.5"
              fill="currentColor"
            />
          );
        })}
      </svg>
    </div>
  </div>
);

// Modern step card with enhanced visual design 
const ModernStepCard = ({ 
  step, 
  index, 
  variant = "orange", 
  inView 
}: { 
  step: typeof jobSeekerSteps[0], 
  index: number, 
  variant?: "orange" | "yellow",
  inView: boolean
}) => {
  // Determine color based on variant
  const gradientColor = variant === "orange" ? step.color : step.color.replace('orange', 'yellow').replace('yellow', 'amber');
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative flex flex-col rounded-xl overflow-hidden group"
    >
      <div className="absolute inset-0 bg-gradient-to-br bg-opacity-80 backdrop-blur-sm transition-all duration-300 -z-10">
        <div className={`absolute inset-0 bg-gradient-to-r ${gradientColor} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
      </div>
      
      <div className="p-6 flex flex-col h-full border border-gray-700 rounded-xl bg-gray-900/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="flex items-start gap-4 mb-3">
          <div className={`relative flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-r ${gradientColor} text-black shadow-md`}>
            <step.icon className="h-6 w-6" />
            <div className="absolute inset-0 rounded-xl bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full bg-gradient-to-r ${gradientColor} text-black shadow-sm`}>
                Step {index + 1}
              </span>
            </div>
            <h3 className="mt-1.5 text-lg font-semibold text-white">{step.name}</h3>
          </div>
        </div>
        
        <p className="mt-1 text-sm text-gray-300 flex-grow">
          {step.description}
        </p>
        
        <div className="mt-4 w-full h-1 rounded-full bg-gray-700 overflow-hidden">
          <motion.div 
            className={`h-full bg-gradient-to-r ${gradientColor}`}
            initial={{ width: 0 }}
            animate={inView ? { width: '100%' } : { width: 0 }}
            transition={{ duration: 1, delay: 0.2 + index * 0.1 }}
          />
        </div>
      </div>
    </motion.div>
  );
};

// Animated connector between steps
const StepConnector = ({ active = false }: { active?: boolean }) => (
  <div className="hidden lg:block absolute left-1/2 h-10 -bottom-10 -translate-x-1/2">
    <motion.div 
      className={`h-full w-0.5 ${active ? 'bg-orange-400' : 'bg-gray-600'}`}
      initial={{ height: 0 }}
      animate={{ height: active ? '100%' : 0 }}
      transition={{ duration: 0.5 }}
    />
  </div>
);

// Subsection component for Job Seekers
function Subsection({ 
  title, 
  description, 
  steps, 
  ctaHref, 
  ctaText, 
  variant = "orange",
  isMobile,
  inView
}: { 
  title: string;
  description: string;
  steps: typeof jobSeekerSteps;
  ctaHref: string;
  ctaText: string;
  variant?: "orange" | "yellow";
  isMobile: boolean;
  inView: boolean;
}) {
  // For mobile devices show only first 3 steps to avoid screen overload
  const displaySteps = isMobile ? steps.slice(0, 3) : steps;
  
  return (
    <div className="relative">
      <motion.div 
        className="text-center mb-8 sm:mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h3 
          className="text-xl sm:text-2xl font-bold text-white mb-3 bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-600"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {title}
        </motion.h3>
        <motion.p 
          className="text-gray-300 max-w-2xl mx-auto text-sm sm:text-base"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {description}
        </motion.p>
      </motion.div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {displaySteps.map((step, index) => (
          <ModernStepCard
            key={step.name}
            step={step}
            index={index}
            variant={variant}
            inView={inView}
          />
        ))}
      </div>
      
      {isMobile && steps.length > 3 && (
        <div className="text-center mt-4 mb-10">
          <p className="text-sm text-gray-400">+ {steps.length - 3} more steps</p>
        </div>
      )}
      
      <motion.div 
        className="mt-10 sm:mt-14 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Button
          asChild
          size={isMobile ? "default" : "lg"}
          className={`${
            variant === "orange" 
              ? "bg-gradient-to-r from-orange-600 via-yellow-600 to-yellow-500 text-black hover:shadow-lg hover:shadow-orange-500/30" 
              : "bg-gradient-to-r from-yellow-600 via-amber-600 to-amber-500 text-black hover:shadow-lg hover:shadow-yellow-500/30"
            } w-full sm:w-auto border-0 transition-all duration-300`}
        >
          <Link href={ctaHref}>
            {ctaText}
            <span aria-hidden="true" className="ml-2">→</span>
          </Link>
        </Button>
      </motion.div>
    </div>
  );
}

export default function HowItWorks() {
  const [jobSeekersRef, jobSeekersInView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });
  
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <Section
      id="how-it-works"
      className="relative isolate overflow-hidden py-16 sm:py-24 lg:py-32 bg-black"
    >
      <TechBackground />
      
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 sm:mb-16"
        >
          <span className="inline-flex items-center rounded-full bg-gradient-to-r from-orange-500/20 to-yellow-500/20 px-3 py-1.5 text-xs sm:text-sm font-medium text-orange-400 mb-4">
            <SparklesIcon className="mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4 text-orange-500" />
            Advanced AI Technology
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-600">
            How Pass.hr Works
          </h2>
          <p className="mt-4 text-gray-300 max-w-3xl mx-auto text-base sm:text-lg">
            Our AI-powered platform streamlines your job search process with smart, adaptive technology
          </p>
        </motion.div>
        
        <div className="space-y-24 sm:space-y-32">
          {/* Job Seekers Section */}
          <div ref={jobSeekersRef}>
            <Subsection
              title="Get More Interviews with AI"
              description="Optimize your job search process with our AI-powered tools"
              steps={jobSeekerSteps}
              ctaHref="/applicants"
              ctaText="Optimize Your Resume"
              variant="orange"
              isMobile={isMobile}
              inView={jobSeekersInView}
            />
          </div>
        </div>
      </div>
    </Section>
  );
} 