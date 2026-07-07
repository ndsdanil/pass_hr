import { apiClient } from './client';

export interface TokenBalance {
  balance: number;
  created_at: string;
  updated_at: string | null;
}

export interface TokenPackage {
  amount: number;
  price: number;
}

// Get token balance
export const getTokenBalance = async (): Promise<TokenBalance> => {
  const response = await apiClient.get('/billing/balance');
  return response.data;
};

// Get available token packages
export const getTokenPackages = async (): Promise<TokenPackage[]> => {
  const response = await apiClient.get('/billing/packages');
  return response.data;
};

// Purchase tokens
export const purchaseTokens = async (packageId: string): Promise<TokenBalance> => {
  const response = await apiClient.post('/billing/purchase', null, {
    params: { package_id: packageId }
  });
  return response.data;
};

export interface TokenRequestPayload {
  package_id: string;
  contact?: string;
  message?: string;
}

export interface TokenRequestResult {
  success: boolean;
  detail: string;
}

// Send token purchase request (Telegram notification to admin)
export const requestTokens = async (data: TokenRequestPayload): Promise<TokenRequestResult> => {
  const response = await apiClient.post('/billing/request-tokens', data);
  return response.data;
}; 