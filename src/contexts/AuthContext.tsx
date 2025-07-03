"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, authService } from '@/services/auth';
import { fetchCurrentUser } from '@/lib/api';
import { tokenUtils } from '@/utils/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      // Verificar se estamos no lado do cliente
      if (typeof window === 'undefined') {
        setLoading(false);
        return;
      }
      
      // Aguardar um pouco para garantir que a aplicação carregou completamente
      await new Promise(resolve => setTimeout(resolve, 100));
      
      try {
        // Verificar se há token antes de buscar dados do usuário
        const token = tokenUtils.getAccessToken();
        if (token && !tokenUtils.isTokenExpired(token)) {
          const currentUser = await fetchCurrentUser();
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Erro ao inicializar autenticação:', error);
        // Limpar tokens em caso de erro
        tokenUtils.removeTokens();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });
      
      // Aguardar um pouco para garantir que os tokens foram salvos e o backend processou
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Tentar buscar dados do usuário com retry mais robusto
      let currentUser = null;
      let attempts = 0;
      const maxAttempts = 5;
      
      while (!currentUser && attempts < maxAttempts) {
        try {
          console.log(`AuthContext: Tentativa ${attempts + 1}/${maxAttempts} para buscar usuário`);
          currentUser = await fetchCurrentUser();
          
          if (currentUser) {
            console.log('AuthContext: Usuário obtido com sucesso:', currentUser);
            setUser(currentUser);
            return;
          }
        } catch (error: any) {
          console.warn(`AuthContext: Tentativa ${attempts + 1} falhou:`, error.message);
          
          // Se é erro de rede, aguardar e tentar novamente
          if (error.message === 'NETWORK_ERROR' && attempts < maxAttempts - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000 * (attempts + 1)));
          } else if (error.message === 'UNAUTHORIZED') {
            // Se é erro de autorização, sair do loop
            throw error;
          }
        }
        attempts++;
      }
      
      // Se chegou aqui e não conseguiu buscar o usuário mas fez login, definir um usuário básico
      if (!currentUser) {
        console.warn('AuthContext: Não foi possível buscar dados do usuário, definindo usuário básico');
        setUser({ 
          id: 0, 
          name: 'Usuário', 
          email: email 
        });
      }
      
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Erro no logout:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
