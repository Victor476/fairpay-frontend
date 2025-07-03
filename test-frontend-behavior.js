// Teste para simular o comportamento do frontend
const API_URL = 'http://localhost:8090';

// Simular a função de validação de token do frontend
function isTokenExpired(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return true;
    }
    
    const payload = JSON.parse(atob(parts[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch {
    return true;
  }
}

// Simular a função fetchApi do frontend
async function fetchApi(endpoint, token) {
  const url = `${API_URL}${endpoint}`;
  
  console.log(`🔍 Fazendo requisição para: ${url}`);
  console.log(`🔑 Token válido? ${!isTokenExpired(token)}`);
  
  const headers = {
    "Content-Type": "application/json",
  };
  
  if (token && !isTokenExpired(token)) {
    headers.Authorization = `Bearer ${token}`;
    console.log('✅ Adicionando Authorization header');
  } else {
    console.warn('❌ Token inválido ou expirado');
  }
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: headers,
      mode: 'cors',
      credentials: 'omit',
      cache: 'no-cache',
      redirect: 'follow'
    });
    
    console.log(`📡 Status: ${response.status}`);
    
    if (!response.ok) {
      if (response.status === 401) {
        console.error("❌ 401 Unauthorized");
        throw new Error("UNAUTHORIZED");
      }
      
      const errorText = await response.text();
      console.error("❌ Erro HTTP:", errorText);
      throw new Error(`Erro HTTP: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ Dados recebidos:', data);
    return data;
    
  } catch (error) {
    console.error(`❌ Erro:`, error.message);
    throw error;
  }
}

async function testFrontendBehavior() {
  console.log('🚀 Testando comportamento do frontend');
  
  // 1. Fazer login para obter token
  console.log('\n=== 1. Login ===');
  try {
    const loginResponse = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'joao63887133398@example.com',
        password: 'senha123'
      })
    });
    
    const loginData = await loginResponse.json();
    const token = loginData.accessToken;
    console.log('✅ Token obtido:', token.substring(0, 50) + '...');
    
    // 2. Fazer múltiplas requisições rapidamente (simular comportamento do React)
    console.log('\n=== 2. Múltiplas requisições rápidas ===');
    
    const promises = [];
    
    // Simular várias requisições simultâneas como o React pode fazer
    for (let i = 0; i < 3; i++) {
      promises.push(
        fetchApi('/api/users/me', token).then(result => ({ type: '/api/users/me', index: i, result }))
      );
      promises.push(
        fetchApi('/api/groups', token).then(result => ({ type: '/api/groups', index: i, result }))
      );
    }
    
    // Aguardar todas as requisições
    const results = await Promise.allSettled(promises);
    
    console.log('\n=== 3. Resultados ===');
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        console.log(`✅ Requisição ${index}: ${result.value.type} - Sucesso`);
      } else {
        console.error(`❌ Requisição ${index}: Falhou - ${result.reason.message}`);
      }
    });
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

testFrontendBehavior();
