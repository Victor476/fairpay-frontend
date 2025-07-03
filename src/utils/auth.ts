export const TOKEN_KEY = 'fairpay_access_token';
export const REFRESH_TOKEN_KEY = 'fairpay_refresh_token';

export const tokenUtils = {
  getAccessToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem(TOKEN_KEY);
    console.log('tokenUtils.getAccessToken: Token recuperado:', token ? token.substring(0, 20) + '...' : 'null');
    return token;
  },

  getRefreshToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setTokens: (accessToken: string, refreshToken: string): void => {
    if (typeof window === 'undefined') return;
    console.log('tokenUtils.setTokens: Salvando tokens...');
    console.log('tokenUtils.setTokens: Access Token:', accessToken?.substring(0, 20) + '...');
    console.log('tokenUtils.setTokens: Refresh Token:', refreshToken?.substring(0, 20) + '...');
    
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    
    // Verificar se foi salvo
    const saved = localStorage.getItem(TOKEN_KEY);
    console.log('tokenUtils.setTokens: Token salvo verificação:', saved ? saved.substring(0, 20) + '...' : 'null');
  },

  removeTokens: (): void => {
    if (typeof window === 'undefined') return;
    console.log('tokenUtils.removeTokens: Removendo tokens...');
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  isTokenExpired: (token: string): boolean => {
    try {
      // Verificar se é um token JWT real
      const parts = token.split('.');
      if (parts.length !== 3) {
        return true; // Token inválido
      }
      
      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch {
      return true; // Token inválido ou expirado
    }
  },

  isTokenNearExpiry: (token: string, marginMinutes: number = 5): boolean => {
    try {
      // Verificar se é um token JWT real
      const parts = token.split('.');
      if (parts.length !== 3) {
        return true; // Token inválido
      }
      
      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Date.now() / 1000;
      const marginSeconds = marginMinutes * 60;
      return payload.exp < (currentTime + marginSeconds);
    } catch {
      return true; // Token inválido ou próximo de expirar
    }
  },
};
