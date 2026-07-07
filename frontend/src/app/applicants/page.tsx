'use client';

import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import './animations.css';
import { 
  DocumentTextIcon,
  RocketLaunchIcon,
  UserIcon,
  ChartBarIcon,
  ClockIcon,
  BriefcaseIcon,
  CurrencyDollarIcon,
  StarIcon,
  LightBulbIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import React from 'react';
import { motion } from 'framer-motion';

const aiServices = [
  {
    name: 'Resume Tuning',
    description: 'Optimize your resume with AI to pass ATS systems and increase your chances of getting interviews. Get personalized recommendations to highlight your achievements and skills effectively.',
    icon: DocumentTextIcon,
    features: [
      'ATS optimization',
      'Keyword analysis',
      'Achievement highlighting',
      'Format improvement'
    ],
    available: true
  },
  {
    name: 'Auto Apply',
    description: 'Automatically discover and apply to relevant positions across multiple job platforms with your optimized resume. Save time and never miss an opportunity.',
    icon: RocketLaunchIcon,
    features: [
      'Smart job matching',
      'One-click apply',
      'Application tracking',
      'Progress analytics'
    ],
    comingSoon: true
  },
  {
    name: 'Interview Assistant',
    description: 'Practice interviews with AI that provides real-time feedback on your responses. Get prepared for different types of interviews and improve your communication skills.',
    icon: UserIcon,
    features: [
      'Mock interviews',
      'Real-time feedback',
      'Industry-specific questions',
      'Communication tips'
    ],
    comingSoon: true
  }
];

const workflowSteps = [
  {
    title: "Tune Your Resume",
    description: "Our AI analyzes your resume and optimizes it for ATS systems and hiring managers.",
    subtitle: "Get a resume that passes through ATS and gets you noticed.",
    icon: DocumentTextIcon,
  },
  {
    title: "Apply to Jobs",
    description: "Automatically discover and apply to matching positions across multiple platforms.",
    subtitle: "Save time with automated job applications.",
    icon: RocketLaunchIcon,
    comingSoon: true
  },
  {
    title: "Ace Interviews",
    description: "Practice with AI and get feedback to improve your interview performance.",
    subtitle: "Build confidence with AI interview preparation.",
    icon: UserIcon,
    comingSoon: true
  }
];

const successMetrics = [
  {
    icon: ClockIcon,
    metric: "70%",
    label: "Faster Job Search",
    description: "Reduce time to land interviews with optimized applications"
  },
  {
    icon: BriefcaseIcon,
    metric: "3x",
    label: "More Interviews",
    description: "Triple your interview invitations with AI-enhanced resumes"
  },
  {
    icon: CurrencyDollarIcon,
    metric: "25%",
    label: "Higher Offers",
    description: "Receive better compensation packages with improved positioning"
  },
  {
    icon: ChartBarIcon,
    metric: "90%",
    label: "Success Rate",
    description: "Users report significant improvement in job search outcomes"
  }
];

const benefits = [
  {
    title: "Personalized Guidance",
    description: "Get tailored advice based on your unique career profile and goals",
    icon: StarIcon
  },
  {
    title: "AI-Powered Insights",
    description: "Leverage advanced AI to optimize every aspect of your job search",
    icon: LightBulbIcon
  },
  {
    title: "Continuous Growth",
    description: "Keep improving with ongoing feedback and career development tips",
    icon: ChartBarIcon
  },
  {
    title: "AI-Powered Matching",
    description: "Our advanced algorithms analyze your skills and experience to match you with jobs where you'll truly excel",
    icon: SparklesIcon
  }
];

// Background component with tech-inspired elements
const TechBackground = () => (
  <div className="absolute inset-0 -z-10 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900/30 to-black"></div>
    
    {/* Tech grid pattern */}
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
    
    {/* Animated elements */}
    <div className="absolute inset-0 opacity-30">
      {[...Array(3)].map((_, i) => (
        <div 
          key={i}
          className="absolute rounded-full bg-orange-500/10 mix-blend-multiply blur-3xl"
          style={{
            width: `${Math.random() * 400 + 100}px`,
            height: `${Math.random() * 400 + 100}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `float-${i} ${20 + i * 5}s infinite ease-in-out`
          }}
        ></div>
      ))}
    </div>
  </div>
);

// Circuit board pattern for sections
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

export default function Applicants() {
  return (
    <>
      <Header />
      <div className="relative isolate overflow-hidden py-24 sm:py-32 bg-black">
        <TechBackground />
        
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8 z-10">
          {/* Hero Section */}
          <motion.div 
            className="mx-auto max-w-2xl text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center justify-center mb-6">
              <motion.div 
                className="flex h-16 w-16 items-center justify-center rounded-full relative"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-500 opacity-20 blur"></div>
                <div className="relative bg-gray-800 rounded-full p-4">
                  <UserIcon className="h-8 w-8 text-orange-500" />
                </div>
              </motion.div>
            </div>
            
            <motion.span 
              className="inline-flex items-center rounded-full bg-gradient-to-r from-orange-500/20 to-yellow-500/20 px-3 py-1.5 text-xs sm:text-sm font-medium text-orange-400 mb-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <SparklesIcon className="mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4 text-orange-500" />
              For Job Seekers
            </motion.span>
            
            <motion.h1 
              className="text-4xl font-bold tracking-tight text-white sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              Land Your Dream Job
            </motion.h1>
            
            <motion.p 
              className="mt-6 text-lg leading-8 text-gray-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Supercharge your job search with AI-powered tools designed to help you stand out from the competition and land interviews faster.
            </motion.p>
            
            <motion.div 
              className="mt-10 flex items-center justify-center gap-x-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <a
                href="/register"
                className="rounded-full bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-600 px-6 py-3 text-sm font-semibold text-black shadow-sm hover:shadow-lg hover:shadow-orange-500/30 transition-all duration-300"
              >
                Get Started
              </a>
              <a 
                href="#services" 
                className="text-sm font-semibold leading-6 text-gray-300 hover:text-orange-400 transition-colors group"
              >
                Learn more 
                <span aria-hidden="true" className="inline-block transition-transform group-hover:translate-x-1 ml-1">→</span>
              </a>
            </motion.div>
          </motion.div>

          {/* AI Services Section */}
          <div id="services" className="mx-auto mt-32 max-w-7xl relative">
            <CircuitPattern />
            
            <motion.div 
              className="mx-auto max-w-2xl text-center mb-16"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-600">
                AI-Powered Job Search Tools
              </h2>
              <p className="mt-4 text-lg leading-8 text-gray-300">
                Advanced AI technology to optimize every aspect of your job search
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 relative z-10">
              {aiServices.map((service, index) => (
                <motion.div 
                  key={service.name} 
                  className="relative group"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-500 rounded-2xl opacity-70 blur-sm group-hover:opacity-100 transition-all duration-500"></div>
                  <div className="relative flex flex-col h-full p-8 rounded-2xl bg-gray-900/80 backdrop-blur-sm shadow-xl border border-gray-700">
                    <div className="flex items-center mb-6">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-orange-500/10 to-yellow-500/10">
                        <service.icon className="h-6 w-6 text-orange-500" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-xl font-semibold text-white">{service.name}</h3>
                        {service.comingSoon && (
                          <span className="inline-flex items-center rounded-full bg-orange-500/10 px-2.5 py-0.5 text-xs font-medium text-orange-400 ring-1 ring-inset ring-orange-500/20">
                            Coming Soon
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-gray-300 mb-6 flex-grow">{service.description}</p>
                    
                    <ul className="space-y-3 mb-8">
                      {service.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center text-gray-300">
                          <div className="h-1.5 w-1.5 rounded-full bg-orange-500 mr-3"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    
                    <div className="mt-auto">
                      {service.available ? (
                        <a
                          href="/dashboard/resume-tuning"
                          className="inline-flex items-center justify-center w-full rounded-lg bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-600 px-4 py-2.5 text-sm font-medium text-black shadow-sm hover:shadow-lg hover:shadow-orange-500/30 transition-all duration-300"
                        >
                          Get Started
                          <span aria-hidden="true" className="ml-2">→</span>
                        </a>
                      ) : (
                        <button
                          disabled
                          className="inline-flex items-center justify-center w-full rounded-lg bg-gray-800 px-4 py-2.5 text-sm font-medium text-gray-400 ring-1 ring-inset ring-gray-600 cursor-not-allowed"
                        >
                          Coming Soon
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Success Metrics Section */}
          <div className="mx-auto mt-32 max-w-7xl">
            <motion.div 
              className="mx-auto max-w-2xl text-center mb-16"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-600">
                Proven Results
              </h2>
              <p className="mt-4 text-lg leading-8 text-gray-300">
                See how our AI-powered platform transforms job searches
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {successMetrics.map((metric, index) => (
                <motion.div 
                  key={metric.label}
                  className="relative group"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-500 rounded-xl opacity-70 blur-sm group-hover:opacity-100 transition-all duration-500"></div>
                  <div className="relative flex flex-col items-center p-6 rounded-xl bg-gray-900/80 backdrop-blur-sm text-center shadow-xl border border-gray-700">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-orange-500/10 to-yellow-500/10 mb-4">
                      <metric.icon className="h-6 w-6 text-orange-500" />
                    </div>
                    <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-600 mb-2">
                      {metric.metric}
                    </div>
                    <div className="text-lg font-semibold text-white mb-2">{metric.label}</div>
                    <p className="text-sm text-gray-300">{metric.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* How It Works Section */}
          <div className="mx-auto mt-32 max-w-7xl">
            <motion.div 
              className="mx-auto max-w-2xl text-center mb-16"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-600">
                How It Works
              </h2>
              <p className="mt-4 text-lg leading-8 text-gray-300">
                Simple steps to transform your job search
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {workflowSteps.map((step, index) => (
                <motion.div 
                  key={step.title}
                  className="relative group"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-500 rounded-2xl opacity-70 blur-sm group-hover:opacity-100 transition-all duration-500"></div>
                  <div className="relative flex flex-col p-8 rounded-2xl bg-gray-900/80 backdrop-blur-sm shadow-xl h-full border border-gray-700">
                    <div className="flex items-center mb-6">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 to-yellow-500 text-black font-bold text-lg">
                        {index + 1}
                      </div>
                      <div className="ml-4">
                        <step.icon className="h-8 w-8 text-orange-500" />
                      </div>
                      {step.comingSoon && (
                        <span className="ml-auto inline-flex items-center rounded-full bg-orange-500/10 px-2.5 py-0.5 text-xs font-medium text-orange-400 ring-1 ring-inset ring-orange-500/20">
                          Coming Soon
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
                    <p className="text-gray-300 mb-4">{step.description}</p>
                    <p className="text-sm text-orange-400 italic">{step.subtitle}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Benefits Section */}
          <div className="mx-auto mt-32 max-w-7xl">
            <motion.div 
              className="mx-auto max-w-2xl text-center mb-16"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-600">
                Why Choose Pass.hr
              </h2>
              <p className="mt-4 text-lg leading-8 text-gray-300">
                The advantages that set us apart
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {benefits.map((benefit, index) => (
                <motion.div 
                  key={benefit.title}
                  className="relative group"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-500 rounded-xl opacity-70 blur-sm group-hover:opacity-100 transition-all duration-500"></div>
                  <div className="relative flex items-start p-6 rounded-xl bg-gray-900/80 backdrop-blur-sm shadow-xl border border-gray-700">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-orange-500/10 to-yellow-500/10 mr-4">
                      <benefit.icon className="h-6 w-6 text-orange-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">{benefit.title}</h3>
                      <p className="text-gray-300">{benefit.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <motion.div 
            className="mx-auto mt-32 max-w-4xl rounded-2xl relative overflow-hidden"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-orange-600 via-yellow-600 to-orange-600 opacity-90"></div>
            <div className="relative px-6 py-16 sm:px-12 sm:py-20 lg:px-16 text-center">
              <motion.h2 
                className="text-3xl font-bold tracking-tight text-white sm:text-4xl"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Ready to Transform Your Career?
              </motion.h2>
              <motion.p 
                className="mt-4 text-lg text-orange-100 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                Join thousands of job seekers who have already upgraded their career prospects with our AI-powered platform.
              </motion.p>
              <motion.div 
                className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <a
                  href="/register"
                  className="inline-block rounded-full px-8 py-3 text-base font-medium text-orange-600 bg-gray-800 shadow-md hover:bg-gray-700 hover:shadow-lg transition-all duration-300"
                >
                  Register
                </a>
                <a
                  href="/pricing"
                  className="inline-block rounded-full px-8 py-3 text-base font-medium text-white bg-transparent ring-2 ring-white hover:bg-white hover:text-orange-600 transition-all duration-300"
                >
                  View Pricing
                </a>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </>
  );
} 