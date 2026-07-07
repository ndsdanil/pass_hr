'use client';

import { useState, useEffect } from 'react';
import { authApi, resumeApi, subscriptionApi } from '@/app/lib/api';
import type { ResumeStats } from '@/app/lib/api';
import Link from 'next/link';

// Service card component
const ServiceCard = ({ title, description, icon, href }: { title: string; description: string; icon: React.ReactNode; href: string }) => (
  <Link href={href} className="block p-6 bg-gray-900 rounded-lg border border-gray-700 shadow-sm hover:shadow-md hover:shadow-orange-500/20 transition-all">
    <div className="flex items-center mb-4">
      <div className="flex-shrink-0 w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center text-orange-500">
        {icon}
      </div>
      <h3 className="ml-4 text-xl font-semibold text-white">{title}</h3>
    </div>
    <p className="text-gray-300">{description}</p>
    <div className="mt-4 flex justify-end">
      <span className="text-orange-500 font-medium hover:underline">Go to service →</span>
    </div>
  </Link>
);

export default function Dashboard() {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    role: 'Job Seeker',
    stats: {
      resumes: 0,
      jobDescriptions: 0,
      tunedResumes: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get user data
        const user = await authApi.getCurrentUser();
        
        // Get statistics
        let stats: ResumeStats;
        try {
          // console.log('Fetching statistics...');
          stats = await resumeApi.getStats();
          // console.log('Received stats:', stats);
        } catch (err) {
          console.error('Failed to get statistics:', err);
          stats = {
            resumes_count: 0,
            job_descriptions_count: 0,
            tuned_resumes_count: 0
          };
        }
        
        // Update state
        setUserData({
          name: user.email.split('@')[0], // Use part of email as name if name is not provided
          email: user.email,
          role: 'Job Seeker',
          stats: {
            resumes: stats.resumes_count,
            jobDescriptions: stats.job_descriptions_count,
            tunedResumes: stats.tuned_resumes_count
          }
        });
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-900/20 border border-red-700/30 p-4 my-6">
        <div className="flex">
          <div className="text-sm text-red-400">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="border-b border-gray-700 pb-5">
        <h1 className="text-2xl font-bold leading-7 text-white sm:truncate sm:text-3xl">
          Welcome, {userData.name}!
        </h1>
        <p className="mt-2 text-sm text-gray-400">
          {userData.role}
        </p>
      </div>

      {/* Statistics */}
      <div className="bg-gray-900 rounded-lg border border-gray-700 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-700 bg-gray-800">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-white">Statistics</h2>
            <Link 
              href="/dashboard/tokens" 
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-black bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              Buy Tokens
            </Link>
          </div>
        </div>
        <div className="px-6 py-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-gray-800 rounded-md p-4 border border-gray-700">
              <p className="text-sm font-medium text-gray-400">Resumes</p>
              <p className="mt-1 text-2xl font-semibold text-white">{userData.stats.resumes}</p>
            </div>
            <div className="bg-gray-800 rounded-md p-4 border border-gray-700">
              <p className="text-sm font-medium text-gray-400">Job Descriptions</p>
              <p className="mt-1 text-2xl font-semibold text-white">{userData.stats.jobDescriptions}</p>
            </div>
            <div className="bg-gray-800 rounded-md p-4 border border-gray-700">
              <p className="text-sm font-medium text-gray-400">Tuned Resumes</p>
              <p className="mt-1 text-2xl font-semibold text-white">{userData.stats.tunedResumes}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Services */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Our Services</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <ServiceCard 
            title="Resume Tuning" 
            description="Improve your resume with AI to increase your chances of getting interviews."
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            }
            href="/dashboard/resume-tuning"
          />
          <ServiceCard 
            title="Auto Apply" 
            description="Automate your job application process and save time."
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            }
            href="/dashboard/auto-apply"
          />
          <ServiceCard 
            title="Interview Assistant" 
            description="Prepare for interviews with our AI assistant."
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
              </svg>
            }
            href="/dashboard/interview"
          />
        </div>
      </div>

      {/* Recent activity */}
      <div className="overflow-hidden bg-gray-900 shadow border border-gray-700 sm:rounded-md">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium leading-6 text-white">Recent Activity</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-400">Your recent actions and notifications</p>
        </div>
        <ul className="divide-y divide-gray-700">
          <li className="px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-orange-500 truncate">Account created</p>
              <div className="ml-2 flex-shrink-0 flex">
                <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-900/30 text-green-400">
                  Today
                </p>
              </div>
            </div>
            <p className="mt-1 text-sm text-gray-400">You have successfully created an account in Pass.hr</p>
          </li>
        </ul>
      </div>
    </div>
  );
} 