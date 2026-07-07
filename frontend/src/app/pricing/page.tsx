'use client';

import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import {
  DocumentTextIcon,
  RocketLaunchIcon,
  ChatBubbleBottomCenterTextIcon,
  CheckIcon,
  XMarkIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { CheckIcon as SolidCheckIcon } from '@heroicons/react/20/solid';

const tokenPackages = [
  {
    name: 'Starter',
    tokens: 50,
    price: 5,
    description: 'Perfect for beginners and trying out our services.',
    features: ['Resume optimization', 'Cover Letter generation', 'Tokens never expire'],
    popular: false,
  },
  {
    name: 'Professional',
    tokens: 250,
    price: 25,
    description: 'Best value for active job seekers applying to multiple positions.',
    features: ['Resume optimization', 'Cover Letter generation', 'Tokens never expire'],
    popular: true,
  },
  {
    name: 'Expert',
    tokens: 500,
    price: 50,
    description: 'Maximum value for intensive job search or career change.',
    features: ['Resume optimization', 'Cover Letter generation', 'Tokens never expire'],
    popular: false,
  }
];

const services = [
  {
    name: 'Resume optimization',
    description: 'Our AI analyzes your resume and provides recommendations for optimizing for ATS systems and increasing your chances of getting an interview.',
    cost: 'Part of complete service'
  },
  {
    name: 'Cover Letter generation',
    description: 'Creating a personalized cover letter that highlights your key skills and matches the requirements of the job.',
    cost: 'Part of complete service'
  }
];

const faqs = [
  {
    question: 'What are tokens and how do they work?',
    answer: 'Tokens are the currency used on our platform to access various services. Each service costs a certain number of tokens. After purchasing a token package, you can use them for any available services on the platform.'
  },
  {
    question: 'How long do tokens last?',
    answer: 'Tokens never expire. You can use them at any time when you need our services.'
  },
  {
    question: 'Can I use tokens for different services?',
    answer: 'Yes, tokens are universal and can be used for all available services on our platform. You decide how to allocate your tokens based on your needs.'
  },
  {
    question: 'Are there recurring payments?',
    answer: 'No, our token packages are one-time purchases. You only pay when you need more tokens.'
  }
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

interface Service {
  name: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  credits: number;
}

const ServiceCard = ({ service }: { service: Service }) => (
  <div className="relative rounded-2xl bg-gray-900/80 backdrop-blur-sm p-6 shadow-lg border border-gray-700">
    <div className="flex items-center">
      <div className="flex-shrink-0">
        <service.icon className="h-6 w-6 text-orange-500" />
      </div>
      <div className="ml-4">
        <h3 className="text-lg font-medium text-white">{service.name}</h3>
        <p className="mt-1 text-sm text-gray-300">{service.description}</p>
      </div>
    </div>
    <div className="mt-4 flex items-center justify-between">
      <div className="flex items-center">
        <span className="text-2xl font-bold text-white">{service.credits}</span>
        <span className="ml-1 text-sm text-gray-400">tokens</span>
      </div>
    </div>
  </div>
);

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

    {/* Additional decorative element */}
    <div
      className="absolute top-1/2 left-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 transform-gpu blur-3xl sm:right-1/4"
      aria-hidden="true"
    >
      <div
        className="aspect-[1108/632] w-[69.25rem] bg-gradient-to-r from-orange-500/20 to-yellow-500/20 opacity-30"
        style={{
          clipPath:
            'polygon(73.6% 51.7%, 91.7% 11.8%, 100% 46.4%, 97.4% 82.2%, 92.5% 84.9%, 75.7% 64%, 55.3% 47.5%, 46.5% 49.4%, 45% 62.9%, 50.3% 87.2%, 21.3% 64.1%, 0.1% 100%, 5.4% 51.1%, 21.4% 63.9%, 58.9% 0.2%, 73.6% 51.7%)',
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

export default function Pricing() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

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
              Pricing Plans
            </motion.span>
            
            <motion.h1 
              className="text-4xl font-bold tracking-tight text-white sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              Choose Your Plan
            </motion.h1>
            
            <motion.p 
              className="mt-6 text-lg leading-8 text-gray-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Choose the perfect token package for your job search needs. All plans include access to our AI tools.
            </motion.p>
          </motion.div>

          {/* Token Packages Section */}
          <div className="mx-auto mt-20 max-w-7xl relative">
            <CircuitPattern />
            
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 relative z-10">
              {tokenPackages.map((pkg, index) => (
                <motion.div 
                  key={pkg.name} 
                  className={classNames(
                    'relative group',
                    pkg.popular ? 'transform scale-105' : ''
                  )}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                >
                  {pkg.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                      <span className="inline-flex items-center rounded-full bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-600 px-4 py-1 text-sm font-medium text-black shadow-lg">
                        Most Popular
                      </span>
                    </div>
                  )}
                  
                  <div className={classNames(
                    'absolute -inset-0.5 rounded-2xl opacity-70 blur-sm group-hover:opacity-100 transition-all duration-500',
                    pkg.popular 
                      ? 'bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-500' 
                      : 'bg-gradient-to-r from-orange-600 via-yellow-600 to-orange-600'
                  )}></div>
                  
                  <div className="relative flex flex-col p-8 rounded-2xl bg-gray-900/80 backdrop-blur-sm text-center shadow-xl h-full border border-gray-700">
                    <h3 className="text-2xl font-bold text-white mb-2">{pkg.name}</h3>
                    <p className="text-gray-300 mb-6">{pkg.description}</p>
                    
                    <div className="mb-8">
                      <div className="flex items-baseline justify-center">
                        <span className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-600">
                          ${pkg.price}
                        </span>
                      </div>
                      <p className="mt-2 text-lg text-gray-300">
                        {pkg.tokens.toLocaleString()} tokens
                      </p>
                    </div>
                    
                    <ul className="space-y-4 mb-8 flex-grow">
                      {pkg.features.map((feature) => (
                        <li key={feature} className="flex items-center text-gray-300">
                          <SolidCheckIcon className="mr-3 h-5 w-5 text-orange-500 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    
                    {isAuthenticated ? (
                      <button
                        onClick={() => router.push('/dashboard/tokens')}
                        className={classNames(
                          'w-full rounded-lg px-6 py-3 text-sm font-semibold shadow-sm transition-all duration-300',
                          pkg.popular
                            ? 'bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-600 text-black hover:shadow-lg hover:shadow-orange-500/30'
                            : 'bg-gray-800 text-white ring-1 ring-inset ring-gray-600 hover:bg-gray-700'
                        )}
                      >
                        Buy Tokens
                      </button>
                    ) : (
                      <button
                        onClick={() => router.push('/login')}
                        className={classNames(
                          'w-full rounded-lg px-6 py-3 text-sm font-semibold shadow-sm transition-all duration-300',
                          pkg.popular
                            ? 'bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-600 text-black hover:shadow-lg hover:shadow-orange-500/30'
                            : 'bg-gray-800 text-white ring-1 ring-inset ring-gray-600 hover:bg-gray-700'
                        )}
                      >
                        Sign In to Buy
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Service Costs Section */}
          <div className="mx-auto mt-32 max-w-7xl">
            <motion.div 
              className="mx-auto max-w-2xl text-center mb-16"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-600">
                Our Services
              </h2>
              <p className="mt-4 text-lg leading-8 text-gray-300">
                Complete resume optimization and cover letter generation - approximately $0.50 on average
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {services.map((service, index) => (
                <motion.div 
                  key={service.name}
                  className="relative group"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-500 rounded-2xl opacity-70 blur-sm group-hover:opacity-100 transition-all duration-500"></div>
                  <div className="relative flex flex-col p-6 rounded-2xl bg-gray-900/80 backdrop-blur-sm shadow-xl h-full border border-gray-700">
                    <h3 className="text-xl font-semibold text-white mb-3">{service.name}</h3>
                    <p className="text-gray-300 mb-4 flex-grow">{service.description}</p>
                    <div className="mt-auto">
                      <span className="inline-flex items-center rounded-full bg-gradient-to-r from-orange-500/10 to-yellow-500/10 px-3 py-1 text-sm font-medium text-orange-400 ring-1 ring-inset ring-orange-500/20">
                        {service.cost}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mx-auto mt-32 max-w-4xl">
            <motion.div 
              className="mx-auto max-w-2xl text-center mb-16"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-600">
                Frequently Asked Questions
              </h2>
              <p className="mt-4 text-lg leading-8 text-gray-300">
                Everything you need to know about our prices and tokens
              </p>
            </motion.div>
            
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <motion.div 
                  key={index}
                  className="relative group"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-500 rounded-xl opacity-70 blur-sm group-hover:opacity-100 transition-all duration-500"></div>
                  <div className="relative p-6 rounded-xl bg-gray-900/80 backdrop-blur-sm border border-gray-700">
                    <h3 className="text-lg font-semibold text-white mb-3">{faq.question}</h3>
                    <p className="text-gray-300">{faq.answer}</p>
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
                Ready to Boost Your Career?
              </motion.h2>
              <motion.p 
                className="mt-4 text-lg text-orange-100 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                Join thousands of job seekers who have already transformed their career prospects with our AI-powered platform.
              </motion.p>
              <motion.div 
                className="mt-8"
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
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </>
  );
} 