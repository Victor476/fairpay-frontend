// Teste específico para reproduzir o problema de 401
// Execute no console do navegador

console.log('🔍 Iniciando teste de requisições problemáticas...');

async function testProblematicRequests() {
  const API_URL = 'http://localhost:8090';
  
  // 1. Primeiro fazer login
  console.log('1. Fazendo login...');
  try {
    const loginResponse = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'joao63887133398@example.com',
        password: 'senha123'
      })
    });
    
    if (!loginResponse.ok) {
      throw new Error(`Login falhou: ${loginResponse.status}`);
    }
    
    const loginData = await loginResponse.json();
    const token = loginData.accessToken;
    console.log('✅ Login realizado com sucesso!');
    console.log('Token:', token.substring(0, 50) + '...');
    
    // Salvar no localStorage como o frontend faz
    localStorage.setItem('fairpay_access_token', token);
    localStorage.setItem('fairpay_refresh_token', loginData.refreshToken);
    
    // 2. Testar /api/users/me múltiplas vezes rapidamente
    console.log('\n2. Testando /api/users/me múltiplas vezes...');
    const mePromises = [];
    for (let i = 0; i < 5; i++) {
      const promise = fetch(`${API_URL}/api/users/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        mode: 'cors',
        credentials: 'omit',
        cache: 'no-cache'
      });
      mePromises.push(promise);
    }
    
    const meResults = await Promise.allSettled(mePromises);
    meResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        console.log(`Teste ${index + 1}: Status ${result.value.status}`);
        if (!result.value.ok) {
          console.error(`❌ Erro ${index + 1}: ${result.value.status} ${result.value.statusText}`);
        } else {
          console.log(`✅ Sucesso ${index + 1}`);
        }
      } else {
        console.error(`❌ Falha ${index + 1}:`, result.reason);
      }
    });
    
    // 3. Testar /api/groups múltiplas vezes rapidamente
    console.log('\n3. Testando /api/groups múltiplas vezes...');
    const groupsPromises = [];
    for (let i = 0; i < 5; i++) {
      const promise = fetch(`${API_URL}/api/groups`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        mode: 'cors',
        credentials: 'omit',
        cache: 'no-cache'
      });
      groupsPromises.push(promise);
    }
    
    const groupsResults = await Promise.allSettled(groupsPromises);
    groupsResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        console.log(`Teste ${index + 1}: Status ${result.value.status}`);
        if (!result.value.ok) {
          console.error(`❌ Erro ${index + 1}: ${result.value.status} ${result.value.statusText}`);
        } else {
          console.log(`✅ Sucesso ${index + 1}`);
        }
      } else {
        console.error(`❌ Falha ${index + 1}:`, result.reason);
      }
    });
    
    // 4. Testar usando as funções do frontend
    console.log('\n4. Testando usando funções do frontend...');
    
    // Importar as funções se disponíveis
    if (window.testFetchGroups) {
      console.log('Testando testFetchGroups...');
      const testResult = await window.testFetchGroups();
      console.log('Resultado:', testResult);
    }
    
    if (window.tokenUtils) {
      console.log('Token do localStorage:', window.tokenUtils.getAccessToken()?.substring(0, 50) + '...');
      console.log('Token expirado?', window.tokenUtils.isTokenExpired(window.tokenUtils.getAccessToken()));
    }
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  }
}

// Executar o teste
testProblematicRequests();
