import apiClient from './apiClient';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'government' | 'contractor' | 'citizen';
  wallet_address?: string;
  is_active: boolean;
  created_at: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'government' | 'contractor' | 'citizen';
  wallet_address?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export const authService = {
  async register(data: RegisterData): Promise<User> {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  async login(data: LoginData): Promise<LoginResponse> {
    const response = await apiClient.post('/auth/login', data);
    // Store token in localStorage
    localStorage.setItem('token', response.data.access_token);
    return response.data;
  },

  async logout(): Promise<void> {
    localStorage.removeItem('token');
    localStorage.removeItem('walletAddress');
  },

  async getProfile(): Promise<User> {
    const response = await apiClient.get('/auth/profile');
    return response.data;
  },

  async connectWallet(walletAddress: string): Promise<User> {
    const response = await apiClient.post('/auth/connect-wallet', {
      wallet_address: walletAddress
    });
    return response.data;
  },

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return !!token;
  },

  getCurrentUser(): User | null {
    // In a real app, you might decode the JWT to get user info
    // For now, we'll return null and let the app fetch the profile
    return null;
  }
};