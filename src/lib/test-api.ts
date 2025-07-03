// Função de teste simplificada
export async function testFetchApi(endpoint: string, token?: string) {
  const url = `http://localhost:8090${endpoint}`;
  
  console.log(`Teste: fazendo requisição para ${url}`);
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log('Token sendo enviado:', token.substring(0, 20) + '...');
  }
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers,
      mode: 'cors',
    });
    
    console.log(`Status: ${response.status}`);
    console.log(`Headers da resposta:`, Object.fromEntries(response.headers.entries()));
    
    const text = await response.text();
    console.log(`Texto da resposta:`, text);
    
    return { status: response.status, text };
  } catch (error: any) {
    console.error('Erro na requisição de teste:', error);
    return { error: error.message };
  }
}

// Função para testar login
export async function testLogin(email: string, password: string) {
  const url = 'http://localhost:8090/api/auth/login';
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
      mode: 'cors',
    });
    
    console.log(`Login Status: ${response.status}`);
    const text = await response.text();
    console.log(`Login Response:`, text);
    
    if (response.ok) {
      const data = JSON.parse(text);
      return data;
    }
    
    return { error: text };
  } catch (error: any) {
    console.error('Erro no login de teste:', error);
    return { error: error.message };
  }
}

// Adicionar ao objeto global para testar no console
if (typeof window !== 'undefined') {
  (window as any).testFetchApi = testFetchApi;
  (window as any).testLogin = testLogin;
}
