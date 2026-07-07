'use client';

import React from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { motion } from 'framer-motion';
import { 
  ShieldCheckIcon, 
  ExclamationTriangleIcon, 
  SparklesIcon,
  LockClosedIcon,
  ServerIcon,
  DocumentTextIcon,
  UserIcon,
  ClipboardDocumentListIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

// Tech-inspired background component
const TechBackground = () => (
  <div className="absolute inset-0 -z-10 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50/30 to-slate-100/20"></div>
    
    {/* Grid pattern */}
    <svg
      className="absolute left-[max(50%,25rem)] top-0 h-[64rem] w-[128rem] -translate-x-1/2 stroke-slate-200/40 [mask-image:radial-gradient(64rem_64rem_at_top,white,transparent)]"
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
          className="absolute rounded-full bg-slate-500/10 mix-blend-multiply blur-3xl"
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
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" className="text-slate-700">
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

// Массив с секциями политики конфиденциальности
const privacySections = [
  {
    id: 'introduction',
    title: 'Introduction',
    icon: DocumentTextIcon,
    content: (
      <p>
        This Privacy Policy describes how pass.hr ("we," "our," or "us") collects, uses, and discloses your personal information when you visit our website, use our services, or otherwise interact with us. Please read this Privacy Policy carefully to understand our practices regarding your personal information and how we will treat it.
      </p>
    )
  },
  {
    id: 'collection',
    title: 'Information We Collect',
    icon: ServerIcon,
    content: (
      <div>
        <p>
          We collect various types of information from and about users of our website and services, including:
        </p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Personal information such as name, email address, and contact details</li>
          <li>Resume and career information</li>
          <li>Usage data and analytics</li>
          <li>Cookies and tracking technologies data</li>
        </ul>
      </div>
    )
  },
  {
    id: 'usage',
    title: 'How We Use Your Information',
    icon: UserIcon,
    content: (
      <div>
        <p>We use the information we collect to:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Provide, maintain, and improve our services</li>
          <li>Communicate with you about our services</li>
          <li>Process your job applications or recruitment needs</li>
          <li>Personalize your experience</li>
          <li>Comply with legal obligations</li>
          <li>Protect our rights and those of our users</li>
        </ul>
      </div>
    )
  },
  {
    id: 'security',
    title: 'Data Storage and Security',
    icon: LockClosedIcon,
    content: (
      <p>
        We implement appropriate technical and organizational measures to protect your personal information. However, no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee its absolute security.
      </p>
    )
  },
  {
    id: 'rights',
    title: 'Your Data Rights',
    icon: EyeIcon,
    content: (
      <div>
        <p>
          Depending on your location, you may have certain rights regarding your personal information, including:
        </p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>The right to access, correct, or delete your personal information</li>
          <li>The right to restrict or object to our processing of your personal information</li>
          <li>The right to data portability</li>
        </ul>
        <p className="mt-2">
          To exercise these rights, please contact us using the details provided below.
        </p>
      </div>
    )
  },
  {
    id: 'contact',
    title: 'Contact Information',
    icon: ClipboardDocumentListIcon,
    content: (
      <p>
        If you have any questions or concerns about this Privacy Policy or our data practices, please contact us at <a href="mailto:privacy@pass.hr" className="text-slate-600 hover:text-slate-900 font-medium">privacy@pass.hr</a>.
      </p>
    )
  },
];

export default function Privacy() {
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
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-slate-500 via-blue-500 to-slate-500 opacity-20 blur"></div>
                <div className="relative bg-white rounded-full p-4">
                  <ShieldCheckIcon className="h-8 w-8 text-slate-600" />
                </div>
              </motion.div>
            </div>
            
            <motion.span 
              className="inline-flex items-center rounded-full bg-gradient-to-r from-slate-500/20 to-blue-500/20 px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-700 mb-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <SparklesIcon className="mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-500" />
              Last Updated: June 15, 2023
            </motion.span>
            
            <motion.h1 
              className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-slate-600 via-blue-600 to-slate-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              Privacy Policy
            </motion.h1>
            
            <motion.p 
              className="mt-6 text-lg leading-8 text-gray-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Your privacy is important to us. This document explains how we collect, use, and protect your information.
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
              <div className="absolute -inset-1 bg-gradient-to-r from-slate-500 via-blue-500 to-slate-500 rounded-xl opacity-25 blur-sm"></div>
              <div className="relative bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-slate-200">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-700">Important Note</h3>
                    <div className="mt-2 text-sm text-gray-700">
                      <p>
                        By using our website and services, you acknowledge that you have read and understand this Privacy Policy. 
                        If you do not agree with our practices, please do not use our services.
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
              <div className="absolute -inset-1 bg-gradient-to-r from-slate-500 via-blue-500 to-slate-500 rounded-xl opacity-25 blur-sm"></div>
              <div className="relative bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-slate-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Navigation</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {privacySections.map((section) => (
                    <a 
                      key={section.id}
                      href={`#${section.id}`}
                      className="text-blue-600 hover:text-blue-800 transition-colors flex items-center"
                    >
                      <section.icon className="h-4 w-4 mr-2" />
                      {section.title}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Privacy Policy Sections */}
          <div className="mx-auto max-w-4xl space-y-12">
            {privacySections.map((section, index) => (
              <motion.div 
                key={section.id}
                id={section.id}
                className="relative bg-white/80 backdrop-blur-sm rounded-xl overflow-hidden"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-slate-500 via-blue-500 to-slate-500 rounded-xl opacity-25 blur-sm"></div>
                <div className="relative p-6 md:p-8">
                  <div className="flex items-center mb-4">
                    <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-slate-500/10 to-blue-500/10">
                      <section.icon className="h-6 w-6 text-slate-600" />
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
