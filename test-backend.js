async function testBackend() {
  const API_URL = 'http://localhost:8090';
  
  try {
    console.log('Testando conectividade com o backend...');
    
    // Teste 1: Endpoint público de login
    console.log('Teste 1: POST /api/auth/login');
    const loginResponse = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'teste@teste.com',
        password: 'senha123'
      })
    });
    
    console.log('Login Status:', loginResponse.status);
    const loginText = await loginResponse.text();
    console.log('Login Response:', loginText);
    
    // Teste 2: Endpoint protegido sem token
    console.log('\nTeste 2: GET /api/users/me (sem token)');
    const meResponse = await fetch(`${API_URL}/api/users/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log('Me Status:', meResponse.status);
    const meText = await meResponse.text();
    console.log('Me Response:', meText);
    
    console.log('\nTeste concluído com sucesso!');
  } catch (error) {
    console.error('Erro no teste:', error);
  }
}

testBackend();
