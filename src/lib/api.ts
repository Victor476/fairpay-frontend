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
  } catch (error) {
    console.error(`Erro ao acessar ${url}:`, error);
    throw error;
  }
}

// Função específica para buscar grupos com fallback para dados mock
export async function fetchUserGroups() {
  const token = tokenUtils.getAccessToken();
  
  // Se não há token, retornar array vazio
  if (!token) {
    return [];
  }
  
  // Se é um token mock, usar dados mock personalizados para o usuário
  if (token.startsWith('mock-jwt-token-')) {
    console.log('Usando dados mock para grupos do usuário');
    
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Extrair informações do token mock para personalizar grupos
    const tokenParts = token.split('-');
    const timestamp = tokenParts[tokenParts.length - 1];
    const userId = parseInt(timestamp) % 1000; // Simular ID do usuário baseado no timestamp
    
    // Grupos personalizados baseados no "usuário"
    const userGroups = [
      {
        id: userId + 1,
        name: "Meu Grupo Principal",
        description: "Grupo pessoal para despesas do dia a dia",
        avatarUrl: null,
        totalExpenses: 342.80,
        membersCount: 2
      },
      {
        id: userId + 2,
        name: "Apartamento",
        description: "Despesas compartilhadas do apartamento",
        avatarUrl: null,
        totalExpenses: 1150.45,
        membersCount: 3
      }
    ];
    
    return userGroups;
  }
  
  try {
    // Fazer requisição real com token JWT (exatamente como você solicitou)
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
    console.warn('Erro ao buscar grupos do backend, usando dados mock:', error.message);
    
    // Se houve erro 401 (token inválido), tokens já foram limpos pelo fetchApi
    if (error.message === 'UNAUTHORIZED') {
      return [];
    }
    
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Dados mock para demonstração em caso de erro de conectividade
    return [
      {
        id: 1001,
        name: "Grupos Offline",
        description: "Dados de exemplo (sem conexão com backend)",
        avatarUrl: null,
        totalExpenses: 540.75,
        membersCount: 4
      },
      {
        id: 1002,
        name: "Grupo Demo",
        description: "Exemplo de grupo quando backend está offline",
        avatarUrl: null,
        totalExpenses: 1250.00,
        membersCount: 3
      }
    ];
  }
}

// Função para buscar informações do usuário atual
export async function fetchCurrentUser() {
  const token = tokenUtils.getAccessToken();
  
  // Se é um token mock ou não há token, usar dados mock
  if (!token || token.startsWith('mock-jwt-token-')) {
    return {
      id: 1,
      name: "Usuário Demo",
      email: "demo@fairpay.com"
    };
  }
  
  try {
    return await fetchApi('/api/users/me');
  } catch (error: any) {
    console.warn('Erro ao buscar usuário do backend, usando dados mock:', error.message);
    
    // Dados mock para demonstração
    return {
      id: 1,
      name: "Usuário Demo",
      email: "demo@fairpay.com"
    };
  }
}