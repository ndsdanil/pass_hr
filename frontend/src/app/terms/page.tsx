'use client';

import React from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { 
  ShieldCheckIcon, 
  ExclamationTriangleIcon,
  SparklesIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  ScaleIcon,
  UserGroupIcon,
  ComputerDesktopIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

// Tech-inspired background component
const TechBackground = () => (
  <div className="absolute inset-0 -z-10 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-b from-white via-blue-50/30 to-indigo-50/20"></div>
    
    {/* Grid pattern */}
    <svg
      className="absolute left-[max(50%,25rem)] top-0 h-[64rem] w-[128rem] -translate-x-1/2 stroke-blue-200/40 [mask-image:radial-gradient(64rem_64rem_at_top,white,transparent)]"
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
          className="absolute rounded-full bg-indigo-500/10 mix-blend-multiply blur-3xl"
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
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" className="text-indigo-700">
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

// Массив с секциями условий использования
const termsSections = [
  {
    id: 'acceptance',
    title: 'Acceptance of Terms',
    icon: ShieldCheckIcon,
    content: (
      <div>
        <p>By accessing or using pass.hr, you agree to be bound by these Terms of Use, our Privacy Policy, and any additional terms that may apply. If you do not agree to these terms, please do not use our services.</p>
        <p className="mt-2">pass.hr reserves the right to modify these terms at any time. Your continued use of our services after any changes indicates your acceptance of the modified terms.</p>
      </div>
    )
  },
  {
    id: 'services',
    title: 'Description of Services',
    icon: ClipboardDocumentListIcon,
    content: (
      <div>
        <p>pass.hr provides AI-powered career tools and services designed to assist job seekers. Our services include but are not limited to resume optimization, job application automation, and interview preparation.</p>
        <p className="mt-2">We use a token-based system for accessing premium features. Specific services and their token costs are detailed on our Pricing page.</p>
      </div>
    )
  },
  {
    id: 'limitation',
    title: 'Limitation of Liability',
    icon: ScaleIcon,
    content: (
      <div>
        <p>pass.hr and its affiliates will not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use our services.</p>
        <p className="mt-2">We do not guarantee employment or specific outcomes from using our services. Results may vary based on individual qualifications, market conditions, and other factors outside our control.</p>
      </div>
    )
  },
  {
    id: 'responsibilities',
    title: 'User Responsibilities',
    icon: UserGroupIcon,
    content: (
      <div>
        <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
        <p className="mt-2">You agree not to use our services for any illegal or unauthorized purpose, including but not limited to creating false resumes, misrepresenting qualifications, or attempting to circumvent our systems.</p>
        <p className="mt-2">You must provide accurate and truthful information when using our services. pass.hr is not responsible for consequences resulting from inaccurate information provided by users.</p>
      </div>
    )
  },
  {
    id: 'ai-disclaimer',
    title: 'AI Content Disclaimer',
    icon: ComputerDesktopIcon,
    content: (
      <div>
        <p>pass.hr utilizes artificial intelligence to generate content and provide recommendations. While we strive for accuracy and relevance, AI-generated content:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>May contain errors or inaccuracies</li>
          <li>Should be reviewed and customized by users before submission</li>
          <li>Does not replace professional judgment</li>
          <li>May not be suitable for all situations or industries</li>
        </ul>
        <p className="mt-2">Users are encouraged to review and modify any AI-generated content to ensure accuracy and appropriateness for their specific needs.</p>
      </div>
    )
  },
  {
    id: 'indemnification',
    title: 'Indemnification',
    icon: ShieldCheckIcon,
    content: (
      <p>You agree to indemnify and hold harmless pass.hr, its affiliates, officers, directors, employees, and agents from any claims, damages, liabilities, costs, or expenses arising from your use of our services or violation of these terms.</p>
    )
  },
  {
    id: 'termination',
    title: 'Termination',
    icon: BoltIcon,
    content: (
      <div>
        <p>pass.hr reserves the right to terminate or suspend your account and access to our services at any time, without prior notice, for conduct that we believe violates these terms or is harmful to other users, us, or third parties, or for any other reason at our sole discretion.</p>
        <p className="mt-2">Upon termination, your right to use pass.hr services will immediately cease. All provisions of these Terms that by their nature should survive termination shall survive, including ownership provisions, warranty disclaimers, indemnity, and limitations of liability.</p>
      </div>
    )
  },
  {
    id: 'governing-law',
    title: 'Governing Law',
    icon: DocumentTextIcon,
    content: (
      <p>These Terms shall be governed by and construed in accordance with the laws of [Jurisdiction], without regard to its conflict of law principles. Any dispute arising from these Terms shall be resolved exclusively in the courts of [Jurisdiction].</p>
    )
  },
  {
    id: 'contact',
    title: 'Contact Information',
    icon: DocumentTextIcon,
    content: (
      <p>If you have any questions or concerns about these Terms of Use, please contact us at <a href="mailto:legal@pass.hr" className="text-blue-600 hover:text-blue-800 font-medium">legal@pass.hr</a>.</p>
    )
  }
];

export default function Terms() {
  return (
    <>
      <Header />
      <div className="relative isolate overflow-hidden py-24 sm:py-32">
        <TechBackground />
        
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8 z-10">
          {/* Hero Section */}
          <motion.div 
            className="mx-auto max-w-2xl text-center mb-16"
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
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 opacity-20 blur"></div>
                <div className="relative bg-white rounded-full p-4">
                  <ShieldCheckIcon className="h-8 w-8 text-blue-600" />
              </div>
              </motion.div>
            </div>

            <motion.span 
              className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-500/20 to-indigo-500/20 px-3 py-1.5 text-xs sm:text-sm font-medium text-blue-700 mb-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <SparklesIcon className="mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500" />
              Last Updated: June 15, 2023
            </motion.span>
            
            <motion.h1 
              className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              Terms of Use
            </motion.h1>
            
            <motion.p 
              className="mt-6 text-lg leading-8 text-gray-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Please read these terms carefully before using our platform. These terms establish the rules for using pass.hr.
            </motion.p>
          </motion.div>

          {/* Alert Banner */}
          <motion.div 
            className="mx-auto max-w-4xl rounded-xl overflow-hidden mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 rounded-xl opacity-25 blur-sm"></div>
              <div className="relative bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-blue-200">
              <div className="flex">
                <div className="flex-shrink-0">
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" aria-hidden="true" />
                </div>
                <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-700">Important Note</h3>
                    <div className="mt-2 text-sm text-gray-700">
                      <p>
                        By using our website and services, you acknowledge that you have read and understand these Terms of Use. 
                        If you do not agree with these terms, please do not use our services.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Navigation */}
          <motion.div 
            className="mx-auto max-w-4xl rounded-xl overflow-hidden mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 rounded-xl opacity-25 blur-sm"></div>
              <div className="relative bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Navigation</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {termsSections.map((section) => (
                    <a 
                      key={section.id}
                      href={`#${section.id}`}
                      className="text-blue-600 hover:text-indigo-600 transition-colors flex items-center"
                    >
                      <section.icon className="h-4 w-4 mr-2" />
                      {section.title}
                    </a>
                  ))}
                </div>
                  </div>
                </div>
          </motion.div>

          {/* Terms Sections */}
          <div className="mx-auto max-w-4xl space-y-12">
            {termsSections.map((section, index) => (
              <motion.div 
                key={section.id}
                id={section.id}
                className="relative bg-white/80 backdrop-blur-sm rounded-xl overflow-hidden"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 rounded-xl opacity-25 blur-sm"></div>
                <div className="relative p-6 md:p-8">
                  <div className="flex items-center mb-4">
                    <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-500/10 to-indigo-500/10">
                      <section.icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">{section.title}</h2>
                  </div>
                  <div className="prose prose-blue max-w-none text-gray-600">
                    {section.content}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
} 
