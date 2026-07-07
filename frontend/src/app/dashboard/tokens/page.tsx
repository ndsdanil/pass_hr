'use client';

import { useState, useEffect } from 'react';
import { CheckIcon } from '@heroicons/react/20/solid';
import { requestTokens } from '@/api/billing';
import { useTokenStore } from '@/store/tokenStore';

const tokenPackages = [
  {
    name: 'Starter',
    id: 'starter',
    tokens: 50,
    price: 5,
    description: 'Perfect for beginners and trying out our services',
    features: [
      '50 points',
      'Resume optimization',
      'Cover Letter generation',
      'Points never expire',
    ],
    mostPopular: false,
  },
  {
    name: 'Professional',
    id: 'professional',
    tokens: 250,
    price: 25,
    description: 'Best value for active job seekers',
    features: [
      '250 points',
      'Resume optimization',
      'Cover Letter generation',
      'Points never expire',
    ],
    mostPopular: true,
  },
  {
    name: 'Expert',
    id: 'expert',
    tokens: 500,
    price: 50,
    description: 'For professional career development',
    features: [
      '500 points',
      'Resume optimization',
      'Cover Letter generation',
      'Points never expire',
    ],
    mostPopular: false,
  },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

interface ModalState {
  open: boolean;
  packageId: string;
  packageName: string;
  packageTokens: number;
  packagePrice: number;
}

export default function Pricing() {
  const { balance, fetchBalance } = useTokenStore();

  const [modal, setModal] = useState<ModalState>({
    open: false,
    packageId: '',
    packageName: '',
    packageTokens: 0,
    packagePrice: 0,
  });
  const [contact, setContact] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; detail: string } | null>(null);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  const openModal = (pkg: typeof tokenPackages[0]) => {
    setResult(null);
    setContact('');
    setMessage('');
    setModal({
      open: true,
      packageId: pkg.id,
      packageName: pkg.name,
      packageTokens: pkg.tokens,
      packagePrice: pkg.price,
    });
  };

  const closeModal = () => {
    setModal(prev => ({ ...prev, open: false }));
    setResult(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await requestTokens({
        package_id: modal.packageId,
        contact: contact.trim() || undefined,
        message: message.trim() || undefined,
      });
      setResult(res);
    } catch {
      setResult({ success: false, detail: 'Network error. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="border-b border-gray-700 pb-5 mb-8">
        <h1 className="text-2xl font-bold leading-7 text-white sm:truncate sm:text-3xl">
          Token Packages
        </h1>
        <p className="mt-2 text-sm text-gray-400">
          Buy tokens to use our services. Tokens never expire!
        </p>
        {balance && (
          <p className="mt-2 text-lg font-semibold text-orange-400">
            Your current balance: {balance.balance} tokens
          </p>
        )}
      </div>

      {/* Pricing tiers */}
      <div className="mx-auto grid max-w-md grid-cols-1 gap-8 lg:max-w-4xl lg:grid-cols-3">
        {tokenPackages.map((pkg) => (
          <div
            key={pkg.id}
            className={classNames(
              pkg.mostPopular ? 'ring-2 ring-orange-500' : 'ring-1 ring-gray-700',
              'rounded-lg shadow-sm bg-gray-900'
            )}
          >
            <div className="p-6">
              <h3
                className={classNames(
                  pkg.mostPopular ? 'text-orange-400' : 'text-white',
                  'text-lg font-semibold leading-8'
                )}
              >
                {pkg.name}
              </h3>
              {pkg.mostPopular && (
                <p className="mt-1 text-sm leading-6 text-orange-400">
                  <strong className="font-semibold">Most popular</strong>
                </p>
              )}
              <p className="mt-2 text-sm leading-6 text-gray-300">{pkg.description}</p>
              <p className="mt-4">
                <span className="text-4xl font-bold tracking-tight text-white">
                  {pkg.price}
                </span>
                <span className="text-sm font-semibold leading-6 text-gray-300"> $</span>
              </p>
              <p className="mt-1 text-sm text-gray-400">
                ({(pkg.price / pkg.tokens).toFixed(2)}$ per point)
              </p>
              <ul role="list" className="mt-6 space-y-3 text-sm leading-6 text-gray-300">
                {pkg.features.map((feature) => (
                  <li key={feature} className="flex gap-x-3">
                    <CheckIcon className="h-5 w-5 flex-none text-orange-500" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => openModal(pkg)}
                className={classNames(
                  pkg.mostPopular
                    ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-black hover:from-orange-600 hover:to-yellow-600'
                    : 'bg-gray-800 text-orange-400 border border-orange-500 hover:bg-gray-700',
                  'mt-6 block w-full rounded-md py-2 px-3 text-center text-sm font-semibold',
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500',
                  'transition-all duration-200'
                )}
              >
                Buy Tokens
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div className="mt-12 bg-gray-900 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Frequently Asked Questions</h3>
        <div className="space-y-4">
          <div>
            <h4 className="text-base font-medium text-white">Do tokens expire?</h4>
            <p className="mt-1 text-sm text-gray-300">
              No, your tokens never expire. Use them whenever you need our services.
            </p>
          </div>
          <div>
            <h4 className="text-base font-medium text-white">How does payment work?</h4>
            <p className="mt-1 text-sm text-gray-300">
              Click "Buy Tokens", fill in the form and we will contact you to arrange the payment.
              Tokens are credited to your account after payment is confirmed.
            </p>
          </div>
          <div>
            <h4 className="text-base font-medium text-white">Can I get a refund?</h4>
            <p className="mt-1 text-sm text-gray-300">
              All purchases are final and non-refundable. Please choose your package carefully.
            </p>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modal.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="w-full max-w-md rounded-xl bg-gray-900 border border-gray-700 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <div>
                <h2 className="text-lg font-semibold text-white">Request Tokens</h2>
                <p className="text-sm text-gray-400 mt-0.5">
                  {modal.packageName} — {modal.packageTokens} tokens / ${modal.packagePrice}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              {result ? (
                /* Success / Error state */
                <div className={classNames(
                  result.success
                    ? 'bg-green-900/30 border-green-700 text-green-300'
                    : 'bg-red-900/30 border-red-700 text-red-300',
                  'rounded-lg border p-4 text-sm'
                )}>
                  <p className="font-semibold mb-1">{result.success ? '✅ Done!' : '❌ Error'}</p>
                  <p>{result.detail}</p>
                  {result.success && (
                    <p className="mt-3 text-gray-400 text-xs">
                      We will get back to you as soon as possible to arrange the payment.
                    </p>
                  )}
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Selected package summary */}
                  <div className="rounded-lg bg-gray-800 border border-orange-500/40 p-4 flex items-center gap-4">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-orange-400">{modal.packageName}</p>
                      <p className="text-xs text-gray-400">{modal.packageTokens} tokens — ${modal.packagePrice}</p>
                    </div>
                    <span className="text-2xl font-bold text-white">${modal.packagePrice}</span>
                  </div>

                  {/* Contact field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">
                      Your contact <span className="text-gray-500">(Telegram or email)</span>
                    </label>
                    <input
                      type="text"
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      placeholder="@username or you@example.com"
                      className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-gray-200 placeholder-gray-500
                                 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>

                  {/* Optional message */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">
                      Message <span className="text-gray-500">(optional)</span>
                    </label>
                    <textarea
                      rows={3}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Any questions or comments..."
                      className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-gray-200 placeholder-gray-500
                                 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-1">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="flex-1 rounded-md border border-gray-600 bg-gray-800 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 rounded-md bg-gradient-to-r from-orange-500 to-yellow-500 py-2 text-sm font-semibold text-black
                                 hover:from-orange-600 hover:to-yellow-600 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                    >
                      {submitting ? 'Sending…' : 'Send Request'}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {result?.success && (
              <div className="p-4 border-t border-gray-700 flex justify-end">
                <button
                  onClick={closeModal}
                  className="rounded-md bg-gray-800 border border-gray-600 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
