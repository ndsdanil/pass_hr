'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Link from 'next/link';
import { 
  DocumentTextIcon,
  UserGroupIcon,
  RocketLaunchIcon,
  SparklesIcon,
  UserIcon
} from '@heroicons/react/24/outline';

interface Service {
  name: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  credits: number;
}

const jobSeekerTools = [
  {
    name: 'Resume Tuning',
    description: 'Our AI analyzes job requirements and optimizes your resume to maximize your chances of getting noticed',
    icon: DocumentTextIcon,
    href: '/resume-tuning',
    available: true,
    features: ['ATS Optimization', 'Keyword Analysis', 'Cover letter generation'],
    badge: 'Most Popular'
  },
  {
    name: 'Auto Apply',
    description: 'Automatically discover and apply to relevant positions across multiple job platforms with your optimized resume',
    icon: RocketLaunchIcon,
    href: '#',
    available: false,
    features: ['Smart Job Matching', 'One-click Apply', 'Application Tracking'],
  },
  {
    name: 'Interview Assistant',
    description: 'AI-powered interview preparation with personalized feedback and practice sessions tailored to your industry',
    icon: UserGroupIcon,
    href: '#',
    available: false,
    features: ['Mock Interviews', 'Real-time Feedback', 'Industry-specific Questions'],
  },
];

// Modern glass card effect with gradient border
const GradientBorder = ({ children }: { children: React.ReactNode }) => (
  <div className="relative group">
    <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-500 rounded-2xl opacity-70 blur-sm group-hover:opacity-100 transition-all duration-500"></div>
    {children}
  </div>
);

// Category header with icon
const CategoryHeader = ({ icon: Icon, title, description }: { icon: React.ComponentType<React.SVGProps<SVGSVGElement>>, title: string, description: string }) => (
  <div className="flex flex-col items-center text-center mb-10 sm:mb-16">
    <div className="rounded-full bg-gradient-to-r from-orange-500/10 to-yellow-500/10 p-3 mb-3 sm:mb-4">
      <Icon className="h-6 w-6 sm:h-7 sm:w-7 text-orange-500" />
    </div>
    <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">{title}</h3>
    <p className="text-gray-300 max-w-2xl text-sm sm:text-base">{description}</p>
  </div>
);

// Circuit board pattern background
const CircuitBoardPattern = () => (
  <div className="absolute inset-0 opacity-5 pointer-events-none">
    {/* This simulates a circuit board pattern background */}
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

// Animated gradient background
const AnimatedGradient = () => (
  <div className="absolute inset-x-0 top-0 -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[-10rem]" aria-hidden="true">
    <div 
      className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-orange-500 to-yellow-500 opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
      style={{
        clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
      }}
    />
  </div>
);

export default function Tools() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <div className="relative isolate bg-black py-16 sm:py-24 lg:py-32 overflow-hidden">
      <CircuitBoardPattern />
      <AnimatedGradient />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center rounded-full bg-gradient-to-r from-orange-500/20 to-yellow-500/20 px-3 py-1.5 text-xs sm:text-sm font-medium text-orange-400 mb-4 sm:mb-6">
            <SparklesIcon className="mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4 text-orange-500" />
            AI-Powered Tools
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white lg:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-600">
            AI-Powered Career Tools
          </h2>
          <p className="mt-4 sm:mt-6 text-sm sm:text-lg leading-6 sm:leading-8 text-gray-300">
            Advanced AI tools designed to help job seekers land their dream job faster and easier
          </p>
        </div>

        <div className="mt-12 sm:mt-20">
          <CategoryHeader 
            icon={UserIcon}
            title="For Job Seekers"
            description="Advanced AI tools to help you land your dream job faster and easier than ever"
          />
          <motion.div
            ref={ref}
            className="mx-auto mt-10 sm:mt-16 max-w-2xl lg:mt-24 lg:max-w-none"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8 }}
          >
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-12 sm:gap-y-16 lg:max-w-none lg:grid-cols-3">
              {jobSeekerTools.map((tool, index) => (
                <motion.div
                  key={tool.name}
                  className="flex flex-col"
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                >
                  <GradientBorder>
                    <div className="relative flex h-auto sm:h-[450px] lg:h-[500px] flex-col rounded-2xl bg-gray-900/80 backdrop-blur-sm p-5 sm:p-8 shadow-xl border border-gray-700">
                      {tool.badge && (
                        <div className="absolute -top-3 -right-3 z-10">
                          <span className="inline-flex items-center rounded-full bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-600 px-2.5 py-1 text-xs font-medium text-black shadow-lg">
                            {tool.badge}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-x-4">
                        <div className="relative flex-shrink-0">
                          <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-500 opacity-75 blur-sm"></div>
                          <div className="relative rounded-lg bg-gray-800 p-2.5">
                            <tool.icon className="h-6 w-6 text-orange-400" aria-hidden="true" />
                          </div>
                        </div>
                        <h3 className="text-base sm:text-lg font-semibold leading-7 sm:leading-8 text-white">{tool.name}</h3>
                        {!tool.available && (
                          <span className="ml-auto inline-flex items-center rounded-full bg-orange-500/10 px-2.5 py-0.5 text-xs font-medium text-orange-400 ring-1 ring-inset ring-orange-500/20 whitespace-nowrap">
                            Coming Soon
                          </span>
                        )}
                      </div>
                      <p className="mt-4 text-sm sm:text-base leading-6 sm:leading-7 text-gray-300">{tool.description}</p>
                      
                      <ul className="mt-5 sm:mt-6 space-y-2 sm:space-y-2.5">
                        {tool.features.map((feature) => (
                          <li key={feature} className="flex items-center text-xs sm:text-sm text-gray-300">
                            <svg className="mr-2 h-4 w-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {feature}
                          </li>
                        ))}
                      </ul>
                      
                      <div className="mt-auto pt-6 sm:pt-8">
                        {tool.available ? (
                          <Link
                            href={tool.href}
                            className="inline-flex items-center justify-center w-full rounded-xl bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-600 px-3.5 py-2.5 text-sm font-medium text-black shadow-md hover:shadow-lg hover:shadow-orange-500/30 transition-all duration-300"
                          >
                            Start Using
                            <span aria-hidden="true" className="ml-2">→</span>
                          </Link>
                        ) : (
                          <Link
                            href="applicants"
                            className="inline-flex items-center justify-center w-full rounded-xl bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-600 px-3.5 py-2.5 text-sm font-medium text-black shadow-md hover:shadow-lg hover:shadow-orange-500/30 transition-all duration-300"
                          >
                            Learn More
                            <span aria-hidden="true" className="ml-2">→</span>
                          </Link>
                        )}
                      </div>
                    </div>
                  </GradientBorder>
                </motion.div>
              ))}
            </dl>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 