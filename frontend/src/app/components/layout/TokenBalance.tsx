'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useTokenStore } from '@/store/tokenStore';

// Fixed styles for the component
const styles = {
  container: 'flex items-center space-x-2 text-gray-300 hover:text-orange-400 min-w-[120px] whitespace-nowrap transition-colors duration-200',
  icon: 'w-5 h-5 flex-shrink-0',
  text: 'font-medium',
  loader: 'flex items-center text-gray-400 min-w-[120px]',
  spinner: 'animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500 mr-2 flex-shrink-0'
};

export default function TokenBalance() {
  const { balance, loading, fetchBalance } = useTokenStore();

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  if (loading) {
    return (
      <div className={styles.loader}>
        <div className={styles.spinner}></div>
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <Link href="/dashboard/tokens" className={styles.container}>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={styles.icon}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
      </svg>
      <span className={styles.text}>{balance?.balance || 0} tokens</span>
    </Link>
  );
} 