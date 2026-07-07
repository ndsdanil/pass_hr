'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import TokenBalance from './TokenBalance';
import { useAuthStore } from '@/store/authStore';

export default function DashboardHeader() {
  const router = useRouter();
  const { logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <header className="dashboard-header">
      <div className="dashboard-header-inner">
        <div className="dashboard-logo-container">
          <Link href="/dashboard" className="flex items-center">
            <span className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent whitespace-nowrap">
              Pass.hr
            </span>
          </Link>
        </div>

        <div className="dashboard-actions-container">
          <div className="flex items-center space-x-6">
            <TokenBalance />
            <button
              onClick={handleLogout}
              className="text-gray-300 hover:text-orange-400 font-medium transition-colors duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
} 