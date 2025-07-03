// Teste para verificar problemas de timing/race condition
const API_URL = 'http://localhost:8090';

async function testRaceCondition() {
  console.log('🚀 Testando race conditions');
  
  // 1. Fazer login
  console.log('\n=== 1. Login ===');
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
  console.log('✅ Token obtido');
  
  // 2. Simular o que acontece quando a página carrega
  // Múltiplas chamadas simultâneas como o React pode fazer
  console.log('\n=== 2. Simulando carregamento da página ===');
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
  
  // Fazer 10 requisições quase simultâneas para cada endpoint
  const promises = [];
  
  console.log('🔄 Fazendo 20 requisições simultâneas (10 para cada endpoint)...');
  
  for (let i = 0; i < 10; i++) {
    // /api/users/me
    promises.push(
      fetch(`${API_URL}/api/users/me`, { headers })
        .then(async res => {
          if (!res.ok) {
            const errorText = await res.text();
            return { endpoint: '/api/users/me', index: i, status: res.status, error: errorText };
          }
          const data = await res.json();
          return { endpoint: '/api/users/me', index: i, status: res.status, success: true, data };
        })
        .catch(error => ({ endpoint: '/api/users/me', index: i, error: error.message }))
    );
    
    // /api/groups
    promises.push(
      fetch(`${API_URL}/api/groups`, { headers })
        .then(async res => {
          if (!res.ok) {
            const errorText = await res.text();
            return { endpoint: '/api/groups', index: i, status: res.status, error: errorText };
          }
          const data = await res.json();
          return { endpoint: '/api/groups', index: i, status: res.status, success: true, data };
        })
        .catch(error => ({ endpoint: '/api/groups', index: i, error: error.message }))
    );
  }
  
  // Aguardar todas
  const results = await Promise.all(promises);
  
  // Analisar resultados
  console.log('\n=== 3. Análise dos Resultados ===');
  
  const successes = results.filter(r => r.success);
  const errors = results.filter(r => !r.success);
  const error401s = results.filter(r => r.status === 401);
  
  console.log(`✅ Sucessos: ${successes.length}/20`);
  console.log(`❌ Erros: ${errors.length}/20`);
  console.log(`🔒 Erros 401: ${error401s.length}/20`);
  
  if (error401s.length > 0) {
    console.log('\n🔍 Detalhes dos erros 401:');
    error401s.forEach((error, idx) => {
      console.log(`  ${idx + 1}. ${error.endpoint}[${error.index}]: ${error.error}`);
    });
  }
  
  if (errors.length > 0 && error401s.length === 0) {
    console.log('\n🔍 Outros erros:');
    errors.forEach((error, idx) => {
      console.log(`  ${idx + 1}. ${error.endpoint}[${error.index}]: Status ${error.status} - ${error.error || error.message}`);
    });
  }
  
  if (errors.length === 0) {
    console.log('\n🎉 Todos os testes passaram! Não há problema de race condition.');
  }
}

testRaceCondition().catch(console.error);
