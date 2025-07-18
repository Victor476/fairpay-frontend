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
    console.log('authService.login: Iniciando login...');
    
    const response = await fetchPublicApi('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    console.log('authService.login: Resposta do login:', response);
    console.log('authService.login: Access Token:', response.accessToken?.substring(0, 20) + '...');
    console.log('authService.login: Refresh Token:', response.refreshToken?.substring(0, 20) + '...');
    
    // Salvar tokens no localStorage
    tokenUtils.setTokens(response.accessToken, response.refreshToken);
    
    // Verificar se foi salvo corretamente
    const savedToken = tokenUtils.getAccessToken();
    console.log('authService.login: Token salvo:', savedToken?.substring(0, 20) + '...');
    console.log('authService.login: Token é válido?', savedToken ? !tokenUtils.isTokenExpired(savedToken) : false);
    
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
