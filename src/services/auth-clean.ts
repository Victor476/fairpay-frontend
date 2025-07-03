import { tokenUtils } from '@/utils/auth';
import { fetchApi, fetchPublicApi } from '@/lib/api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
}

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await fetchPublicApi('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    // Salvar tokens no localStorage
    tokenUtils.setTokens(response.accessToken, response.refreshToken);
    
    return response;
  },

  logout: async (): Promise<void> => {
    try {
      await fetchApi('/api/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.warn('Erro ao fazer logout no servidor (usando logout local):', error);
    }
    
    tokenUtils.removeTokens();
  },

  getCurrentUser: async (): Promise<User | null> => {
    const token = tokenUtils.getAccessToken();
    
    if (!token) {
      return null;
    }

    if (tokenUtils.isTokenExpired(token)) {
      return null;
    }

    try {
      const response = await fetchApi('/api/users/me');
      return response;
    } catch (error) {
      console.error('Erro ao obter usuário atual:', error);
      tokenUtils.removeTokens();
      return null;
    }
  },

  refreshAccessToken: async (): Promise<string | null> => {
    const refreshToken = tokenUtils.getRefreshToken();
    
    if (!refreshToken) {
      return null;
    }

    try {
      const response = await fetchPublicApi('/api/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });
      
      tokenUtils.setTokens(response.accessToken, response.refreshToken);
      return response.accessToken;
    } catch (error) {
      console.error('Erro ao renovar token:', error);
      tokenUtils.removeTokens();
      return null;
    }
  },
};
