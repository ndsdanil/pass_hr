'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updatePassword, updateEmail, deleteAccount } from '@/api/user';

export default function Settings() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await updatePassword({
        current_password: currentPassword,
        new_password: newPassword
      });
      setSuccess('Password successfully updated');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError('Failed to update password. Please check your current password.');
    }
  };

  const handleEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      await updateEmail({ email: newEmail });
      setSuccess('Email successfully updated');
      setNewEmail('');
    } catch (err) {
      setError('Failed to update email. It may already be in use.');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount();
      router.push('/login');
    } catch (err) {
      setError('Failed to delete account');
    }
  };

  return (
    <div className="space-y-8">
      <div className="border-b border-gray-700 pb-5">
        <h1 className="text-2xl font-bold leading-7 text-white sm:truncate sm:text-3xl">
          Settings
        </h1>
        <p className="mt-2 text-sm text-gray-400">
          Manage your account settings
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-red-900/20 border border-red-700/30 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-400">{error}</h3>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-900/20 border border-green-700/30 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-400">{success}</h3>
            </div>
          </div>
        </div>
      )}

      {/* Change Password */}
      <div className="bg-gray-900 border border-gray-700 shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-white">Change Password</h3>
          <form onSubmit={handlePasswordUpdate} className="mt-5 space-y-4">
            <div>
              <label htmlFor="current-password" className="block text-sm font-medium text-gray-300">
                Current Password
              </label>
              <input
                type="password"
                id="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-white placeholder-gray-400 shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="new-password" className="block text-sm font-medium text-gray-300">
                New Password
              </label>
              <input
                type="password"
                id="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-white placeholder-gray-400 shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-300">
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-white placeholder-gray-400 shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500 sm:text-sm"
              />
            </div>
            <button
              type="submit"
              className="inline-flex justify-center rounded-md border border-transparent bg-gradient-to-r from-orange-500 to-yellow-500 py-2 px-4 text-sm font-medium text-black shadow-sm hover:from-orange-600 hover:to-yellow-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-200"
            >
              Update Password
            </button>
          </form>
        </div>
      </div>

      {/* Change Email */}
      <div className="bg-gray-900 border border-gray-700 shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-white">Change Email</h3>
          <form onSubmit={handleEmailUpdate} className="mt-5">
            <div>
              <label htmlFor="new-email" className="block text-sm font-medium text-gray-300">
                New Email
              </label>
              <input
                type="email"
                id="new-email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-white placeholder-gray-400 shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500 sm:text-sm"
              />
            </div>
            <button
              type="submit"
              className="mt-4 inline-flex justify-center rounded-md border border-transparent bg-gradient-to-r from-orange-500 to-yellow-500 py-2 px-4 text-sm font-medium text-black shadow-sm hover:from-orange-600 hover:to-yellow-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-200"
            >
              Update Email
            </button>
          </form>
        </div>
      </div>

      {/* Delete Account */}
      <div className="bg-gray-900 border border-gray-700 shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-white">Delete Account</h3>
          <div className="mt-2 max-w-xl text-sm text-gray-400">
            <p>
              Once you delete your account, all of your data will be permanently removed. This action cannot be undone.
            </p>
          </div>
          <div className="mt-5">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-red-900/20 border-red-700 px-4 py-2 font-medium text-red-400 hover:bg-red-900/40 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900 sm:text-sm transition-all duration-200"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-black bg-opacity-75 transition-opacity"></div>
            <div className="inline-block align-bottom bg-gray-900 border border-gray-700 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-900/20 border border-red-700 sm:mx-0 sm:h-10 sm:w-10">
                  <svg className="h-6 w-6 text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-white">
                    Confirm Deletion
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-400">
                      Are you sure you want to delete your account? All of your data will be permanently removed.
                      This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:ring-offset-gray-900 sm:ml-3 sm:w-auto sm:text-sm transition-all duration-200"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-600 shadow-sm px-4 py-2 bg-gray-800 text-base font-medium text-gray-300 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 focus:ring-offset-gray-900 sm:mt-0 sm:w-auto sm:text-sm transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 