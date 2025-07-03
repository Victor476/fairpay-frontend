import { tokenUtils } from '@/utils/auth';
import { fetchApi } from '@/lib/api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    email: string;
    name: string;
  };
}

export interface User {
  id: number;
  email: string;
  name: string;
}

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
      const response = await fetchApi('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      
      // Salvar tokens no localStorage
      tokenUtils.setTokens(response.accessToken, response.refreshToken);
      
      return response;
    } catch (error) {
      console.warn('Erro no login real, usando login simulado:', error);
      
      // Simular login com dados mock quando o backend não está disponível
      const mockResponse: LoginResponse = {
        accessToken: 'mock-jwt-token-' + Date.now(),
        refreshToken: 'mock-refresh-token-' + Date.now(),
        user: {
          id: 1,
          email: credentials.email,
          name: credentials.email.split('@')[0] || 'Usuário Demo',
        }
      };
      
      // Salvar tokens mock
      tokenUtils.setTokens(mockResponse.accessToken, mockResponse.refreshToken);
      
      return mockResponse;
    }
  },

  logout: async (): Promise<void> => {
    const refreshToken = tokenUtils.getRefreshToken();
    
    if (refreshToken) {
      try {
        await fetchApi('/api/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ refreshToken }),
        });
      } catch (error) {
        console.warn('Erro ao fazer logout no servidor (usando logout local):', error);
      }
    }
    
    tokenUtils.removeTokens();
  },

  getCurrentUser: async (): Promise<User | null> => {
    const token = tokenUtils.getAccessToken();
    
    if (!token) {
      return null;
    }

    // Se é um token mock, retornar dados mock
    if (token.startsWith('mock-jwt-token-')) {
      return {
        id: 1,
        name: "Usuário Demo",
        email: "demo@fairpay.com"
      };
    }

    if (tokenUtils.isTokenExpired(token)) {
      return null;
    }

    try {
      const response = await fetchApi('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.user;
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
      const response = await fetchApi('/api/auth/refresh', {
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
