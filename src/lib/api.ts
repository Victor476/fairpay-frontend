import { tokenUtils } from '@/utils/auth';
import { authService } from '@/services/auth';
import { CreateExpenseRequest, CreateExpenseResponse, Expense } from '@/types/expense';
import { GroupInviteLinkRequest, GroupInviteLinkResponse, GroupJoinResponse } from '@/types/invite';

// Cache para evitar requisições duplicadas
const requestCache = new Map<string, Promise<any>>();
const CACHE_DURATION = 1000; // 1 segundo

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8090";

// Função para limpar cache
const clearCacheEntry = (key: string) => {
  setTimeout(() => {
    requestCache.delete(key);
  }, CACHE_DURATION);
};

// Importar funções de teste em desenvolvimento
// Comentado temporariamente para evitar problemas no build
// if (process.env.NODE_ENV === 'development') {
//   import('./test-api');
//   import('./test-xhr');
// }

export async function fetchApi(endpoint: string, options?: RequestInit) {
  const url = `${API_URL}${endpoint}`;
  const method = options?.method || 'GET';
  
  // Verificar se estamos no lado do cliente
  if (typeof window === 'undefined') {
    console.warn('fetchApi: Tentativa de requisição no servidor (SSR), retornando erro');
    throw new Error('NETWORK_ERROR');
  }
  
  // Criar chave única para a requisição
  const cacheKey = `${method}:${url}:${JSON.stringify(options?.body || {})}`;
  
  // Se é uma requisição GET e já existe uma requisição em andamento, reutilizar
  if (method === 'GET' && requestCache.has(cacheKey)) {
    console.log('fetchApi: Reutilizando requisição em cache para:', url);
    return requestCache.get(cacheKey);
  }
  
  // Obter token de acesso automaticamente
  let token = tokenUtils.getAccessToken();
  console.log('fetchApi: Token obtido:', token ? token.substring(0, 50) + '...' : 'null');
  
  // Verificar se o token está próximo de expirar (menos de 5 minutos restantes)
  if (token && tokenUtils.isTokenExpired(token)) {
    console.warn('fetchApi: Token expirado, tentando renovar...');
    try {
      const newToken = await authService.refreshAccessToken();
      if (newToken) {
        token = newToken;
        console.log('fetchApi: Token renovado com sucesso');
      } else {
        console.warn('fetchApi: Falha ao renovar token, removendo tokens');
        tokenUtils.removeTokens();
        token = null;
      }
    } catch (error) {
      console.error('fetchApi: Erro ao renovar token:', error);
      tokenUtils.removeTokens();
      token = null;
    }
  }
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  
  // Adicionar token de autorização se disponível
  if (token) {
    headers.Authorization = `Bearer ${token}`;
    console.log('fetchApi: Adicionando Authorization header com token válido');
  } else {
    console.warn('fetchApi: Nenhum token válido disponível');
  }
  
  const requestPromise = (async () => {
  
  try {
    console.log(`Fazendo requisição para: ${url}`);
    console.log('Headers:', headers);
    console.log('Method:', options?.method || 'GET');
    
    // Usar fetch global explicitamente e configurar para evitar problemas
    const fetchOptions: RequestInit = {
      method: options?.method || 'GET',
      headers: {
        ...headers,
        ...options?.headers,
      },
      body: options?.body,
      mode: 'cors',
      credentials: 'omit', // Não enviar cookies
      cache: 'no-cache',
      redirect: 'follow'
    };
    
    console.log('Fetch options:', fetchOptions);
    
    // Tentar fazer a requisição com retry em caso de erro de rede
    let lastError;
    const maxRetries = 3;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Tentativa ${attempt}/${maxRetries} para ${url}`);
        console.log('Verificando conectividade com o backend...');
        
        // Verificar se a URL está formada corretamente
        console.log('URL completa:', url);
        console.log('Fetch options:', JSON.stringify(fetchOptions, null, 2));
        
        const response = await globalThis.fetch(url, fetchOptions);
        
        console.log(`Resposta recebida: ${response.status} ${response.statusText}`);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
          // Se for 401 (Unauthorized), limpar tokens e sinalizar erro de auth
          if (response.status === 401) {
            console.warn("Token inválido ou expirado.");
            tokenUtils.removeTokens();
            throw new Error("UNAUTHORIZED");
          }
          
          const errorText = await response.text();
          console.error("Erro HTTP:", errorText);
          throw new Error(`Erro HTTP: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Dados recebidos:', data);
        return data;
        
      } catch (fetchError: any) {
        lastError = fetchError;
        
        // Se é erro de rede e ainda temos tentativas
        if (fetchError.name === 'TypeError' && 
            (fetchError.message.includes('fetch failed') || fetchError.message.includes('Failed to fetch')) &&
            attempt < maxRetries) {
          console.log(`Erro de rede na tentativa ${attempt}, aguardando antes de tentar novamente...`);
          await new Promise(resolve => setTimeout(resolve, attempt * 1000)); // Wait progressively longer
          continue;
        }
        
        // Para outros tipos de erro, não tentar novamente
        throw fetchError;
      }
    }
    
    // Se chegou aqui, todas as tentativas falharam
    throw lastError;
    
  } catch (error: any) {
    console.error(`Erro ao acessar ${url}:`, error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      cause: error.cause,
      stack: error.stack
    });
    
    // Verificar se é um erro de rede
    if (error.name === 'TypeError' && (error.message.includes('fetch failed') || error.message.includes('Failed to fetch'))) {
      throw new Error("NETWORK_ERROR");
    }
    
    throw error;
  }
  })();

  // Adicionar ao cache se for GET
  if (method === 'GET') {
    requestCache.set(cacheKey, requestPromise);
    clearCacheEntry(cacheKey);
  }
  
  return requestPromise;
}

// Função específica para buscar grupos
export async function fetchUserGroups() {
  // Verificar se estamos no lado do cliente
  if (typeof window === 'undefined') {
    console.warn('fetchUserGroups: Chamada no servidor (SSR), retornando array vazio');
    return [];
  }
  
  const token = tokenUtils.getAccessToken();
  
  // Se não há token, retornar array vazio
  if (!token) {
    console.log('fetchUserGroups: Nenhum token encontrado');
    return [];
  }
  
  // Verificar se o token é válido
  if (tokenUtils.isTokenExpired(token)) {
    console.warn("Token expirado, removendo tokens");
    tokenUtils.removeTokens();
    return [];
  }

  console.log('fetchUserGroups: Token válido encontrado, fazendo requisição...');
  
  try {
    return await fetchApi('/api/groups');
  } catch (error: any) {
    console.error('Erro ao buscar grupos do backend:', error.message);
    console.error('Tipo do erro:', error.name);
    console.error('Erro completo:', error);
    
    // Se houve erro 401 (token inválido), tokens já foram limpos
    if (error.message === 'UNAUTHORIZED') {
      return [];
    }
    
    // Se erro de rede (backend offline), não lançar erro
    if (error.message === 'NETWORK_ERROR' || error.message === 'BACKEND_OFFLINE') {
      console.warn('Backend não está acessível para buscar grupos');
      return [];
    }
    
    // Para outros erros, também retornar array vazio
    return [];
  }
}

// Função para buscar informações do usuário atual
export async function fetchCurrentUser() {
  // Verificar se estamos no lado do cliente
  if (typeof window === 'undefined') {
    console.warn('fetchCurrentUser: Chamada no servidor (SSR), retornando null');
    return null;
  }
  
  const token = tokenUtils.getAccessToken();
  
  // Se não há token, retornar null
  if (!token) {
    console.log('fetchCurrentUser: Nenhum token encontrado');
    return null;
  }
  
  // Verificar se o token é válido (não expirado)
  if (tokenUtils.isTokenExpired(token)) {
    console.warn("Token expirado, removendo tokens");
    tokenUtils.removeTokens();
    return null;
  }

  console.log('fetchCurrentUser: Token válido encontrado, fazendo requisição...');
  console.log('Token:', token.substring(0, 50) + '...');

  try {
    return await fetchApi('/api/users/me');
  } catch (error: any) {
    console.error('Erro ao buscar usuário do backend:', error.message);
    console.error('Tipo do erro:', error.name);
    console.error('Erro completo:', error);
    
    // Se erro de autorização, limpar tokens
    if (error.message === 'UNAUTHORIZED') {
      tokenUtils.removeTokens();
      return null;
    }
    
    // Se erro de rede (backend offline), não lançar erro
    if (error.message === 'NETWORK_ERROR' || error.message === 'BACKEND_OFFLINE') {
      console.warn('Backend não está acessível, continuando sem autenticação');
      // Re-throw o erro para que o AuthContext possa tentar novamente
      throw error;
    }
    
    // Para outros erros, também retornar null (não autenticado)
    console.warn('fetchCurrentUser: Retornando null devido a erro:', error.message);
    return null;
  }
}

// Função para criar novo grupo
export async function createGroup(groupData: {
  name: string;
  description?: string;
  imageUrl?: string;
}) {
  console.log('🚀 [createGroup] Iniciando criação de grupo:', groupData);
  
  // Validar entrada
  if (!groupData.name || !groupData.name.trim()) {
    throw new Error("O nome do grupo é obrigatório");
  }

  try {
    // Usar fetchApi que já lida com autenticação e headers
    const response = await fetchApi('/api/groups', {
      method: 'POST',
      body: JSON.stringify({
        name: groupData.name.trim(),
        description: groupData.description?.trim() || null,
        imageUrl: groupData.imageUrl?.trim() || null
      })
    });

    console.log('✅ [createGroup] Grupo criado com sucesso:', response);
    return response;
    
  } catch (error: any) {
    console.error('❌ [createGroup] Erro ao criar grupo:', error);
    
    // Re-throw com mensagens mais específicas
    if (error.message === 'UNAUTHORIZED') {
      throw new Error('Sua sessão expirou. Faça login novamente.');
    } else if (error.message === 'NETWORK_ERROR') {
      throw new Error('Erro de conexão. Verifique sua internet e tente novamente.');
    } else if (error.message.includes('409')) {
      throw new Error('Já existe um grupo com este nome.');
    } else if (error.message.includes('400')) {
      throw new Error('Dados inválidos. Verifique os campos e tente novamente.');
    } else if (error.message.includes('500')) {
      throw new Error('Erro interno do servidor. Tente novamente mais tarde.');
    } else {
      throw new Error(error.message || 'Erro ao criar grupo. Tente novamente.');
    }
  }
}

// Função de teste simplificada
export async function testFetchGroups() {
  const token = tokenUtils.getAccessToken();
  console.log('=== TESTE DE GRUPOS ===');
  console.log('Token:', token ? `${token.substring(0, 20)}...` : 'NENHUM');
  
  if (!token) {
    console.error('❌ Nenhum token encontrado');
    return { error: 'NO_TOKEN' };
  }
  
  console.log('✅ Token encontrado, testando validade...');
  const isExpired = tokenUtils.isTokenExpired(token);
  console.log('Token expirado?', isExpired);
  
  if (isExpired) {
    console.error('❌ Token expirado');
    return { error: 'TOKEN_EXPIRED' };
  }
  
  try {
    console.log('🚀 Fazendo requisição...');
    const response = await fetch(`${API_URL}/api/groups`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      mode: 'cors',
      credentials: 'omit'
    });
    
    console.log('📡 Status da resposta:', response.status);
    console.log('📡 Headers da resposta:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro na resposta:', errorText);
      return { error: 'HTTP_ERROR', status: response.status, message: errorText };
    }
    
    const data = await response.json();
    console.log('✅ Dados recebidos:', data);
    return { success: true, data };
    
  } catch (error: any) {
    console.error('❌ Erro na requisição:', error);
    return { error: 'FETCH_ERROR', details: error.message };
  }
}

// Adicionar funções de teste ao window em desenvolvimento
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).testFetchGroups = testFetchGroups;
  (window as any).tokenUtils = tokenUtils;
  (window as any).API_URL = API_URL;
}

// Função para requisições públicas (sem autenticação)
export async function fetchPublicApi(endpoint: string, options?: RequestInit) {
  const url = `${API_URL}${endpoint}`;
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  
  try {
    console.log(`Fazendo requisição pública para: ${url}`);
    console.log('Headers:', headers);
    console.log('Method:', options?.method || 'GET');
    
    const response = await fetch(url, {
      method: options?.method || 'GET',
      headers: {
        ...headers,
        ...options?.headers,
      },
      body: options?.body,
    });
    
    console.log(`Resposta recebida: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erro HTTP:", errorText);
      throw new Error(`Erro HTTP: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Dados recebidos:', data);
    return data;
    
  } catch (error: any) {
    console.error(`Erro ao acessar ${url}:`, error);
    
    // Verificar se é um erro de rede
    if (error.name === 'TypeError' && (error.message.includes('fetch failed') || error.message.includes('Failed to fetch'))) {
      throw new Error("NETWORK_ERROR");
    }
    
    throw error;
  }
}

// Função para buscar grupo específico por ID
export async function fetchGroupById(groupId: string | number) {
  console.log('🔍 [fetchGroupById] Buscando grupo ID:', groupId);
  
  if (!groupId) {
    throw new Error("ID do grupo é obrigatório");
  }

  try {
    const response = await fetchApi(`/api/groups/${groupId}`);
    console.log('✅ [fetchGroupById] Grupo encontrado:', response);
    return response;
    
  } catch (error: any) {
    console.error('❌ [fetchGroupById] Erro ao buscar grupo:', error);
    
    if (error.message === 'UNAUTHORIZED') {
      throw new Error('Sua sessão expirou. Faça login novamente.');
    } else if (error.message === 'NETWORK_ERROR') {
      throw new Error('Erro de conexão. Verifique sua internet e tente novamente.');
    } else if (error.message.includes('404')) {
      throw new Error('Grupo não encontrado.');
    } else if (error.message.includes('403')) {
      throw new Error('Você não tem permissão para acessar este grupo.');
    } else {
      throw new Error(error.message || 'Erro ao buscar grupo. Tente novamente.');
    }
  }
}

// Funções relacionadas a despesas

export async function createExpense(groupId: string, expenseData: CreateExpenseRequest): Promise<CreateExpenseResponse> {
  // Verificar se estamos no lado do cliente
  if (typeof window === 'undefined') {
    console.warn('createExpense: Chamada no servidor (SSR), rejeitando');
    throw new Error('Esta operação só pode ser realizada no cliente');
  }

  if (!groupId) {
    throw new Error("ID do grupo é obrigatório");
  }

  console.log('📝 [createExpense] Criando despesa:', { groupId, expenseData });

  try {
    const response = await fetchApi(`/api/expenses`, {
      method: 'POST',
      body: JSON.stringify(expenseData)
    });
    
    console.log('✅ [createExpense] Despesa criada:', response);
    return response;
    
  } catch (error: any) {
    console.error('❌ [createExpense] Erro ao criar despesa:', error);
    
    if (error.message === 'UNAUTHORIZED') {
      throw new Error('Sua sessão expirou. Faça login novamente.');
    } else if (error.message === 'NETWORK_ERROR') {
      throw new Error('Erro de conexão. Verifique sua internet e tente novamente.');
    } else if (error.message.includes('403')) {
      throw new Error('Você não tem permissão para criar despesas neste grupo.');
    } else if (error.message.includes('400')) {
      throw new Error('Dados inválidos. Verifique os campos obrigatórios.');
    } else {
      throw new Error(error.message || 'Erro ao criar despesa. Tente novamente.');
    }
  }
}

export async function fetchGroupExpenses(groupId: string): Promise<Expense[]> {
  // Verificar se estamos no lado do cliente
  if (typeof window === 'undefined') {
    console.warn('fetchGroupExpenses: Chamada no servidor (SSR), retornando array vazio');
    return [];
  }

  if (!groupId) {
    throw new Error("ID do grupo é obrigatório");
  }

  const token = tokenUtils.getAccessToken();
  
  // Se não há token, retornar array vazio
  if (!token) {
    console.log('fetchGroupExpenses: Nenhum token encontrado');
    return [];
  }

  // Verificar se o token é válido
  if (tokenUtils.isTokenExpired(token)) {
    console.warn("Token expirado, removendo tokens");
    tokenUtils.removeTokens();
    return [];
  }

  console.log('📋 [fetchGroupExpenses] Buscando despesas do grupo:', groupId);

  try {
    const response = await fetchApi(`/api/expenses/group/${groupId}`);
    console.log('✅ [fetchGroupExpenses] Despesas encontradas:', response);
    return response;
    
  } catch (error: any) {
    console.error('❌ [fetchGroupExpenses] Erro ao buscar despesas:', error);
    
    if (error.message === 'UNAUTHORIZED') {
      return [];
    }
    
    if (error.message === 'NETWORK_ERROR' || error.message === 'BACKEND_OFFLINE') {
      console.warn('Backend não está acessível para buscar despesas');
      return [];
    }
    
    // Para outros erros, também retornar array vazio
    return [];
  }
}

export async function fetchGroupMembers(groupId: string): Promise<any[]> {
  // Verificar se estamos no lado do cliente
  if (typeof window === 'undefined') {
    console.warn('fetchGroupMembers: Chamada no servidor (SSR), retornando array vazio');
    return [];
  }

  if (!groupId) {
    throw new Error("ID do grupo é obrigatório");
  }

  const token = tokenUtils.getAccessToken();
  
  // Se não há token, retornar array vazio
  if (!token) {
    console.log('fetchGroupMembers: Nenhum token encontrado');
    return [];
  }

  // Verificar se o token é válido
  if (tokenUtils.isTokenExpired(token)) {
    console.warn("Token expirado, removendo tokens");
    tokenUtils.removeTokens();
    return [];
  }

  console.log('👥 [fetchGroupMembers] Buscando membros do grupo:', groupId);

  try {
    const response = await fetchApi(`/api/groups/${groupId}/members`);
    console.log('✅ [fetchGroupMembers] Membros encontrados:', response);
    return Array.isArray(response) ? response : [response];
    
  } catch (error: any) {
    console.error('❌ [fetchGroupMembers] Erro ao buscar membros:', error);
    
    if (error.message === 'UNAUTHORIZED') {
      return [];
    }
    
    if (error.message === 'NETWORK_ERROR' || error.message === 'BACKEND_OFFLINE') {
      console.warn('Backend não está acessível para buscar membros');
      return [];
    }
    
    // Para outros erros, também retornar array vazio
    return [];
  }
}

// Funções relacionadas a convites de grupo
export async function generateInviteLink(groupId: string, requestData?: GroupInviteLinkRequest): Promise<GroupInviteLinkResponse> {
  // Verificar se estamos no lado do cliente
  if (typeof window === 'undefined') {
    console.warn('generateInviteLink: Chamada no servidor (SSR), rejeitando');
    throw new Error('Esta operação só pode ser realizada no cliente');
  }

  if (!groupId) {
    throw new Error("ID do grupo é obrigatório");
  }

  console.log('🔗 [generateInviteLink] Gerando link de convite:', { groupId, requestData });

  try {
    const response = await fetchApi(`/api/groups/${groupId}/invite-link`, {
      method: 'POST',
      body: JSON.stringify(requestData || { expiresInDays: 7 })
    });
    
    console.log('✅ [generateInviteLink] Link gerado:', response);
    return response;
    
  } catch (error: any) {
    console.error('❌ [generateInviteLink] Erro ao gerar link:', error);
    
    if (error.message === 'UNAUTHORIZED') {
      throw new Error('Sua sessão expirou. Faça login novamente.');
    } else if (error.message === 'NETWORK_ERROR') {
      throw new Error('Erro de conexão. Verifique sua internet e tente novamente.');
    } else if (error.message.includes('400') || error.message.includes('Apenas o criador')) {
      throw new Error('Apenas o criador do grupo pode gerar links de convite.');
    } else if (error.message.includes('403')) {
      throw new Error('Você não tem permissão para gerar convites neste grupo.');
    } else if (error.message.includes('404')) {
      throw new Error('Grupo não encontrado.');
    } else {
      throw new Error(error.message || 'Erro ao gerar link de convite. Tente novamente.');
    }
  }
}

export async function joinGroupByToken(token: string): Promise<GroupJoinResponse> {
  // Verificar se estamos no lado do cliente
  if (typeof window === 'undefined') {
    console.warn('joinGroupByToken: Chamada no servidor (SSR), rejeitando');
    throw new Error('Esta operação só pode ser realizada no cliente');
  }

  if (!token) {
    throw new Error("Token de convite é obrigatório");
  }

  const authToken = tokenUtils.getAccessToken();
  
  // Se não há token de autenticação, precisa fazer login primeiro
  if (!authToken) {
    throw new Error('Você precisa fazer login para aceitar o convite');
  }

  console.log('🎫 [joinGroupByToken] Aceitando convite:', token);

  try {
    const response = await fetchApi(`/api/groups/join/${token}`, {
      method: 'GET'
    });
    
    console.log('✅ [joinGroupByToken] Convite aceito:', response);
    return response;
    
  } catch (error: any) {
    console.error('❌ [joinGroupByToken] Erro ao aceitar convite:', error);
    
    if (error.message === 'UNAUTHORIZED') {
      throw new Error('Você precisa fazer login para aceitar o convite.');
    } else if (error.message === 'NETWORK_ERROR') {
      throw new Error('Erro de conexão. Verifique sua internet e tente novamente.');
    } else if (error.message.includes('404')) {
      throw new Error('Convite não encontrado ou expirado.');
    } else if (error.message.includes('400')) {
      throw new Error('Convite inválido ou você já é membro deste grupo.');
    } else {
      throw new Error(error.message || 'Erro ao aceitar convite. Tente novamente.');
    }
  }
}

export async function acceptGroupInvite(token: string): Promise<GroupJoinResponse> {
  // Verificar se estamos no lado do cliente
  if (typeof window === 'undefined') {
    console.warn('acceptGroupInvite: Chamada no servidor (SSR), rejeitando');
    throw new Error('Esta operação só pode ser realizada no cliente');
  }

  if (!token) {
    throw new Error("Token de convite é obrigatório");
  }

  console.log('🤝 [acceptGroupInvite] Aceitando convite:', { token: token.substring(0, 10) + '...' });

  try {
    const response = await fetchApi(`/api/groups/join/${token}`, {
      method: 'GET'
    });
    
    console.log('✅ [acceptGroupInvite] Convite aceito:', response);
    return response;
    
  } catch (error: any) {
    console.error('❌ [acceptGroupInvite] Erro ao aceitar convite:', error);
    
    if (error.message === 'UNAUTHORIZED') {
      throw new Error('Você precisa fazer login para aceitar o convite.');
    } else if (error.message === 'NETWORK_ERROR') {
      throw new Error('Erro de conexão. Verifique sua internet e tente novamente.');
    } else if (error.message.includes('404')) {
      throw new Error('Convite não encontrado ou expirado.');
    } else if (error.message.includes('400')) {
      throw new Error('Convite inválido ou você já é membro deste grupo.');
    } else {
      throw new Error(error.message || 'Erro ao aceitar convite. Tente novamente.');
    }
  }
}
