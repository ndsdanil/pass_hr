'use client';

import React, { useState } from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import './animations.css';
import { motion } from 'framer-motion';
import { 
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { apiClient } from '@/api/client';

const TechBackground = () => (
  <div className="absolute inset-0 -z-10 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900/30 to-black"></div>
    <svg
      className="absolute left-[max(50%,25rem)] top-0 h-[64rem] w-[128rem] -translate-x-1/2 stroke-orange-500/20 [mask-image:radial-gradient(64rem_64rem_at_top,white,transparent)]"
      aria-hidden="true"
    >
      <defs>
        <pattern id="tech-grid" width={100} height={100} x="50%" y={-1} patternUnits="userSpaceOnUse">
          <path d="M100 100V.5M.5 .5H100" fill="none" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" strokeWidth={0} fill="url(#tech-grid)" />
    </svg>
    <div className="absolute inset-x-0 top-28 -z-10 transform-gpu overflow-hidden blur-3xl" aria-hidden="true">
      <div
        className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-orange-500 to-yellow-500 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
        style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}
      />
    </div>
  </div>
);

export default function Contacts() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; detail: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);
    try {
      const res = await apiClient.post('/billing/contact', {
        name: name.trim() || undefined,
        email: email.trim(),
        message: message.trim(),
      });
      setResult(res.data);
      if (res.data.success) {
        setName('');
        setEmail('');
        setMessage('');
      }
    } catch {
      setResult({ success: false, detail: 'Network error. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <React.Fragment>
      <Header />
      <div className="relative isolate overflow-hidden py-24 sm:py-32 bg-black">
        <TechBackground />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8 z-10">
          {/* Hero */}
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
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-500 opacity-20 blur"></div>
                <div className="relative bg-gray-800 rounded-full p-4">
                  <ChatBubbleLeftRightIcon className="h-8 w-8 text-orange-500" />
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
              Get in Touch
            </motion.span>

            <motion.h1
              className="text-4xl font-bold tracking-tight text-white sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              Contact Us
            </motion.h1>

            <motion.p
              className="mt-6 text-lg leading-8 text-gray-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Have a question or feedback? Send us a message and we&apos;ll get back to you as soon as possible.
            </motion.p>
          </motion.div>

          {/* Contact Form */}
          <div className="mx-auto max-w-xl">
            <motion.div
              className="relative group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-500 rounded-2xl opacity-70 blur-sm group-hover:opacity-100 transition-all duration-500"></div>

              <div className="relative p-8 rounded-2xl bg-gray-900/80 backdrop-blur-sm shadow-xl border border-gray-700">
                {result ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`flex flex-col items-center text-center py-6 rounded-xl border px-6 ${
                      result.success
                        ? 'bg-green-900/30 border-green-700'
                        : 'bg-red-900/30 border-red-700'
                    }`}
                  >
                    {result.success ? (
                      <CheckCircleIcon className="h-12 w-12 text-green-400 mb-4" />
                    ) : (
                      <ExclamationCircleIcon className="h-12 w-12 text-red-400 mb-4" />
                    )}
                    <p className={`text-base font-semibold mb-1 ${result.success ? 'text-green-300' : 'text-red-300'}`}>
                      {result.success ? 'Message sent!' : 'Something went wrong'}
                    </p>
                    <p className="text-sm text-gray-400">{result.detail}</p>
                    {!result.success && (
                      <button
                        onClick={() => setResult(null)}
                        className="mt-4 text-sm text-orange-400 hover:text-orange-300 underline"
                      >
                        Try again
                      </button>
                    )}
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1.5">
                        Name <span className="text-gray-500">(optional)</span>
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Your name"
                        className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2.5 text-sm text-gray-200 placeholder-gray-500
                                   focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1.5">
                        Email <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2.5 text-sm text-gray-200 placeholder-gray-500
                                   focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1.5">
                        Message <span className="text-red-400">*</span>
                      </label>
                      <textarea
                        required
                        rows={5}
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        placeholder="How can we help you?"
                        className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2.5 text-sm text-gray-200 placeholder-gray-500
                                   focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-colors resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-yellow-500
                                 py-3 text-sm font-semibold text-black hover:from-orange-600 hover:to-yellow-600
                                 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {submitting ? (
                        <>
                          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Sending…
                        </>
                      ) : (
                        <>
                          <PaperAirplaneIcon className="h-4 w-4" />
                          Send Message
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </React.Fragment>
  );
}
