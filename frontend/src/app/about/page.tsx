'use client';

import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import './animations.css';
import { motion } from 'framer-motion';
import { 
  UsersIcon, 
  ClockIcon, 
  DocumentTextIcon, 
  SparklesIcon,
  HeartIcon,
  LightBulbIcon,
  StarIcon
} from '@heroicons/react/24/outline';

// Company stats for display
const stats = [
  { name: 'Team members', value: '12', icon: UsersIcon },
  { name: 'Processed CVs', value: '20,000+', icon: DocumentTextIcon },
  { name: 'Happy clients', value: '5,000+', icon: HeartIcon },
];

// Core values of the company
const values = [
  {
    name: 'Innovation',
    description: 'We constantly push the boundaries of what\'s possible with AI to deliver cutting-edge solutions that transform how people approach job hunting and recruitment.',
    icon: LightBulbIcon,
  },
  {
    name: 'Efficiency',
    description: 'Our tools are designed to save time and effort, streamlining complex processes into simple, intuitive workflows that deliver results quickly.',
    icon: ClockIcon,
  },
  {
    name: 'Quality',
    description: 'We\'re committed to excellence in everything we do, from the accuracy of our AI algorithms to the user experience of our platform.',
    icon: StarIcon,
  },
  {
    name: 'Human-centric',
    description: 'Despite being an AI-powered platform, we maintain a focus on the human element. Our technology exists to empower people, not replace them.',
    icon: HeartIcon,
  },
];

// Tech-inspired background component
const TechBackground = () => (
  <div className="absolute inset-0 -z-10 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900/30 to-black"></div>
    
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

// Tech circuit pattern component
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

export default function About() {
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
                  <SparklesIcon className="h-8 w-8 text-orange-500" />
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
              Our Story
            </motion.span>
            
            <motion.h1 
              className="text-4xl font-bold tracking-tight text-white sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              About Pass.hr
            </motion.h1>
            
            <motion.p 
              className="mt-6 text-lg leading-8 text-gray-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              We're on a mission to revolutionize the job market by harnessing the power of AI to connect the right people with the right opportunities.
            </motion.p>
          </motion.div>

          {/* Stats Section */}
          <div className="mx-auto mt-20 max-w-7xl relative">
            <CircuitPattern />
            
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 relative z-10">
              {stats.map((stat, index) => (
                <motion.div 
                  key={stat.name} 
                  className="relative group"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-500 rounded-2xl opacity-70 blur-sm group-hover:opacity-100 transition-all duration-500"></div>
                  <div className="relative flex flex-col items-center p-8 rounded-2xl bg-gray-900/80 backdrop-blur-sm text-center shadow-xl border border-gray-700">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-orange-500/10 to-yellow-500/10 mb-4">
                      <stat.icon className="h-6 w-6 text-orange-500" />
                    </div>
                    <div className="font-bold text-4xl bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-600 mb-2">
                      {stat.value}
                    </div>
                    <div className="text-lg font-medium text-white">{stat.name}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Our Story Section */}
          <div className="mx-auto mt-32 max-w-5xl">
            <div className="relative overflow-hidden rounded-3xl">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-500 opacity-20"></div>
              <div className="relative p-8 md:p-12 bg-gray-900/60 backdrop-blur-sm border border-gray-700">
                <motion.div 
                  className="mx-auto max-w-2xl text-center mb-12"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                >
                  <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-600">
                    Our Mission & Vision
                  </h2>
                </motion.div>
                
                <div className="mt-6 space-y-6 text-lg text-gray-300">
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    We are a team of passionate IT professionals who have spent our entire careers immersed in the tech industry. Throughout these years, we've experienced every nuance of the job search process—the anxiety of finding the right opportunity, the challenge of standing out among countless applicants, and the excitement of landing that perfect role.
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                  >
                    These shared experiences have shown us firsthand just how complicated, stressful, and time-consuming the job search journey can be. The sleepless nights before interviews, the endless hours perfecting resumes, the uncertainty of whether your application will even be seen—we've felt it all.
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                  >
                    That's why we're building Pass.hr with heart and purpose. Our mission is beautifully simple: to help talented professionals find their perfect career opportunities and make the job search process more human, more effective, and less stressful. We believe deeply that every candidate deserves the chance to shine in roles that truly fit them, with tools that help them present their best selves.
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                  >
                    With every feature we develop and every solution we craft, we're guided by this vision: a world where technology doesn't just make hiring faster—it makes it better. Where connections between talent and opportunity are formed with intention, understanding, and a genuine appreciation for what makes each person unique.
                  </motion.p>
                </div>
              </div>
            </div>
          </div>

          {/* Our Values Section */}
          <div className="mx-auto mt-32 max-w-7xl">
            <div className="mx-auto max-w-2xl text-center mb-16">
              <motion.h2 
                className="text-3xl font-bold tracking-tight text-white sm:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-600"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                Our Values
              </motion.h2>
              <motion.p 
                className="mt-4 text-lg leading-8 text-gray-300"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                The core principles that guide everything we do
              </motion.p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {values.map((value, index) => (
                <motion.div 
                  key={value.name} 
                  className="relative group"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-500 rounded-xl opacity-70 blur-sm group-hover:opacity-100 transition-all duration-500"></div>
                  <div className="relative flex flex-col h-full rounded-xl bg-gray-900/80 backdrop-blur-sm p-8 shadow-xl border border-gray-700">
                    <div className="flex items-center gap-x-4 mb-6">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-orange-500/10 to-yellow-500/10">
                        <value.icon className="h-6 w-6 text-orange-500" />
                      </div>
                      <h3 className="text-xl font-semibold text-white">{value.name}</h3>
                    </div>
                    <p className="text-gray-300">{value.description}</p>
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
                Join the Pass.hr Family
              </motion.h2>
              <motion.p 
                className="mt-4 text-lg text-orange-100 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                Ready to take your career to the next level? Our AI-powered platform is here to help you find your dream job faster and easier than ever.
              </motion.p>
              <motion.div 
                className="mt-10"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <a
                  href="/login"
                  className="inline-block rounded-full px-8 py-3 text-base font-medium text-orange-600 bg-gray-800 shadow-md hover:bg-orange-700 hover:shadow-lg transition-all duration-300"
                >
                  Get Started
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