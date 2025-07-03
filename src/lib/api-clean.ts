import { tokenUtils } from '@/utils/auth';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8090";

export async function fetchApi(endpoint: string, options?: RequestInit) {
  const url = `${API_URL}${endpoint}`;
  
  // Obter token de acesso automaticamente
  const token = tokenUtils.getAccessToken();
  
  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };
  
  // Adicionar token de autorização se disponível
  if (token && !tokenUtils.isTokenExpired(token)) {
    defaultHeaders.Authorization = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options?.headers,
      },
    });
    
    // Obtenha o texto da resposta primeiro
    const text = await response.text();
    
    // Tente parsear o JSON apenas se houver conteúdo
    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch{
      console.error("Resposta não é um JSON válido:", text);
      throw new Error("Resposta do servidor não é um JSON válido");
    }
    
    if (!response.ok) {
      // Se for 401 (Unauthorized), limpar tokens e sinalizar erro de auth
      if (response.status === 401) {
        console.warn("Token inválido ou expirado.");
        tokenUtils.removeTokens();
        throw new Error("UNAUTHORIZED");
      }
      throw new Error(data.message || `Erro HTTP: ${response.status} ${response.statusText}`);
    }
    
    return data;
  } catch (error: any) {
    console.error(`Erro ao acessar ${url}:`, error);
    
    // Verificar se é um erro de conexão (ECONNREFUSED)
    if (error.code === 'ECONNREFUSED' || error.cause?.code === 'ECONNREFUSED') {
      throw new Error("BACKEND_OFFLINE");
    }
    
    // Verificar se é um erro de rede
    if (error.name === 'TypeError' && error.message.includes('fetch failed')) {
      throw new Error("NETWORK_ERROR");
    }
    
    throw error;
  }
}

// Função específica para buscar grupos
export async function fetchUserGroups() {
  const token = tokenUtils.getAccessToken();
  
  // Se não há token, retornar array vazio
  if (!token) {
    return [];
  }
  
  // Verificar se o token é válido
  if (tokenUtils.isTokenExpired(token)) {
    console.warn("Token expirado, removendo tokens");
    tokenUtils.removeTokens();
    return [];
  }
  
  try {
    // Fazer requisição real com token JWT
    const response = await fetch(`${API_URL}/api/groups`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        console.warn("Token inválido ou expirado.");
        tokenUtils.removeTokens();
        throw new Error("UNAUTHORIZED");
      }
      throw new Error(`Erro HTTP: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Erro ao buscar grupos do backend:', error.message);
    
    // Se houve erro 401 (token inválido), tokens já foram limpos
    if (error.message === 'UNAUTHORIZED') {
      return [];
    }
    
    // Para outros erros, também retornar array vazio
    return [];
  }
}

// Função para buscar informações do usuário atual
export async function fetchCurrentUser() {
  const token = tokenUtils.getAccessToken();
  
  // Se não há token, retornar null
  if (!token) {
    return null;
  }
  
  // Verificar se o token é válido (não expirado)
  if (tokenUtils.isTokenExpired(token)) {
    console.warn("Token expirado, removendo tokens");
    tokenUtils.removeTokens();
    return null;
  }
  
  try {
    return await fetchApi('/api/users/me');
  } catch (error: any) {
    console.error('Erro ao buscar usuário do backend:', error.message);
    
    // Se erro de autorização, limpar tokens
    if (error.message === 'UNAUTHORIZED') {
      tokenUtils.removeTokens();
      return null;
    }
    
    // Para outros erros, também retornar null (não autenticado)
    return null;
  }
}

// Função para criar novo grupo
export async function createGroup(groupData: {
  name: string;
  description?: string;
  imageUrl?: string;
}) {
  const token = tokenUtils.getAccessToken();
  
  // Se não há token, retornar erro
  if (!token) {
    throw new Error("Token de autenticação não encontrado");
  }
  
  // Verificar se o token é válido
  if (tokenUtils.isTokenExpired(token)) {
    console.warn("Token expirado, removendo tokens");
    tokenUtils.removeTokens();
    throw new Error("UNAUTHORIZED");
  }
  
  // Fazer requisição real com token JWT
  const response = await fetch(`${API_URL}/api/groups`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(groupData)
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      console.warn("Token inválido ou expirado.");
      tokenUtils.removeTokens();
      throw new Error("UNAUTHORIZED");
    }
    
    const errorText = await response.text();
    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { message: errorText };
    }
    
    throw new Error(errorData.message || `Erro HTTP: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  return data;
}

// Função para requisições públicas (sem autenticação)
export async function fetchPublicApi(endpoint: string, options?: RequestInit) {
  const url = `${API_URL}${endpoint}`;
  
  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options?.headers,
      },
    });
    
    // Obtenha o texto da resposta primeiro
    const text = await response.text();
    
    // Tente parsear o JSON apenas se houver conteúdo
    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch{
      console.error("Resposta não é um JSON válido:", text);
      throw new Error("Resposta do servidor não é um JSON válido");
    }
    
    if (!response.ok) {
      throw new Error(data.message || `Erro HTTP: ${response.status} ${response.statusText}`);
    }
    
    return data;
  } catch (error: any) {
    console.error(`Erro ao acessar ${url}:`, error);
    
    // Verificar se é um erro de conexão (ECONNREFUSED)
    if (error.code === 'ECONNREFUSED' || error.cause?.code === 'ECONNREFUSED') {
      throw new Error("BACKEND_OFFLINE");
    }
    
    // Verificar se é um erro de rede
    if (error.name === 'TypeError' && error.message.includes('fetch failed')) {
      throw new Error("NETWORK_ERROR");
    }
    
    throw error;
  }
}
