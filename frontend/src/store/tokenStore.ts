import { create } from 'zustand';
import { getTokenBalance } from '@/api/billing';
import type { TokenBalance } from '@/api/billing';

interface TokenStore {
  balance: TokenBalance | null;
  loading: boolean;
  error: string | null;
  fetchBalance: () => Promise<void>;
}

export const useTokenStore = create<TokenStore>((set) => ({
  balance: null,
  loading: false,
  error: null,
  fetchBalance: async () => {
    try {
      set({ loading: true, error: null });
      const data = await getTokenBalance();
      set({ balance: data });
    } catch (err) {
      console.error('Failed to load balance:', err);
      set({ error: 'Failed to load balance' });
    } finally {
      set({ loading: false });
    }
  },
})); 