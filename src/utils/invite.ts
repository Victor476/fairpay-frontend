// Utilitários relacionados a convites

/**
 * Extrai o token de convite de uma URL completa
 * @param url - URL completa do convite (ex: http://localhost:8090/api/groups/join/abc123)
 * @returns Token do convite ou null se não conseguir extrair
 */
export function extractInviteTokenFromUrl(url: string): string | null {
  if (!url) return null;
  
  try {
    // Extrair a última parte da URL que é o token
    const parts = url.split('/');
    const token = parts[parts.length - 1];
    
    // Validar se parece com um UUID/token válido
    if (token && token.length > 10) {
      return token;
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao extrair token da URL:', error);
    return null;
  }
}

/**
 * Converte uma URL de backend para URL do frontend
 * @param backendUrl - URL do backend (ex: http://localhost:8090/api/groups/join/abc123)
 * @returns URL do frontend (ex: http://localhost:3000/invite/abc123)
 */
export function convertToFrontendInviteUrl(backendUrl: string): string | null {
  const token = extractInviteTokenFromUrl(backendUrl);
  if (!token) return null;
  
  const frontendBaseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
  return `${frontendBaseUrl}/invite/${token}`;
}

/**
 * Valida se um token de convite tem formato válido
 * @param token - Token do convite
 * @returns true se o token parece válido
 */
export function validateInviteToken(token: string): boolean {
  if (!token) return false;
  
  // Verificar se tem um comprimento mínimo e formato de UUID-like
  return token.length >= 10 && /^[a-zA-Z0-9-]+$/.test(token);
}
