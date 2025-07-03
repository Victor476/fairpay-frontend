const https = require('https');
const http = require('http');

// Simula localStorage para o teste
let mockLocalStorage = {};

const localStorage = {
  getItem: (key) => mockLocalStorage[key] || null,
  setItem: (key, value) => { mockLocalStorage[key] = value; },
  removeItem: (key) => { delete mockLocalStorage[key]; },
  clear: () => { mockLocalStorage = {}; }
};

// Simula o tokenUtils
const tokenUtils = {
  getAccessToken: () => {
    const token = localStorage.getItem('accessToken');
    console.log('🔑 Token retrieved from localStorage:', token ? `${token.substring(0, 20)}...` : 'null');
    return token;
  },
  setAccessToken: (token) => {
    localStorage.setItem('accessToken', token);
    console.log('💾 Token saved to localStorage');
  }
};

// Simula o fetchApi
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const token = tokenUtils.getAccessToken();
    
    // Configura headers como no fetchApi real
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('🚀 Request with Authorization header:', `Bearer ${token.substring(0, 20)}...`);
    } else {
      console.log('⚠️  Request WITHOUT Authorization header');
    }

    const urlParts = new URL(url);
    const protocol = urlParts.protocol === 'https:' ? https : http;
    
    const requestOptions = {
      hostname: urlParts.hostname,
      port: urlParts.port,
      path: urlParts.pathname + urlParts.search,
      method: options.method || 'GET',
      headers: headers
    };

    const req = protocol.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const result = data ? JSON.parse(data) : {};
          console.log(`📊 Response ${res.statusCode}:`, result);
          resolve({ status: res.statusCode, data: result });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

async function simulateBrowserFlow() {
  console.log('🌐 Simulando fluxo do navegador...\n');

  // 1. Simula login
  console.log('1️⃣ Fazendo login...');
  try {
    const loginResponse = await makeRequest('http://localhost:8090/api/auth/login', {
      method: 'POST',
      body: {
        email: 'joao.teste@example.com',
        password: 'senha123'
      }
    });

    if (loginResponse.status === 200 && loginResponse.data.accessToken) {
      tokenUtils.setAccessToken(loginResponse.data.accessToken);
      console.log('✅ Login bem-sucedido!\n');
    } else {
      console.log('❌ Falha no login:', loginResponse);
      return;
    }
  } catch (error) {
    console.log('❌ Erro no login:', error.message);
    return;
  }

  // 2. Simula busca de grupos (deveria incluir token)
  console.log('2️⃣ Buscando grupos do usuário...');
  try {
    const groupsResponse = await makeRequest('http://localhost:8090/api/groups');
    
    if (groupsResponse.status === 200) {
      console.log('✅ Grupos obtidos com sucesso!\n');
    } else {
      console.log('❌ Falha ao obter grupos:', groupsResponse);
    }
  } catch (error) {
    console.log('❌ Erro ao obter grupos:', error.message);
  }

  // 3. Simula busca de usuário atual (deveria incluir token)
  console.log('3️⃣ Buscando dados do usuário atual...');
  try {
    const userResponse = await makeRequest('http://localhost:8090/api/users/me');
    
    if (userResponse.status === 200) {
      console.log('✅ Dados do usuário obtidos com sucesso!\n');
    } else {
      console.log('❌ Falha ao obter dados do usuário:', userResponse);
    }
  } catch (error) {
    console.log('❌ Erro ao obter dados do usuário:', error.message);
  }

  // 4. Limpa o token e tenta acessar recurso protegido
  console.log('4️⃣ Testando acesso sem token...');
  localStorage.clear();
  
  try {
    const unauthorizedResponse = await makeRequest('http://localhost:8090/api/groups');
    
    if (unauthorizedResponse.status === 401) {
      console.log('✅ Acesso negado corretamente sem token!\n');
    } else {
      console.log('❌ PROBLEMA: Acesso permitido sem token:', unauthorizedResponse);
    }
  } catch (error) {
    console.log('❌ Erro esperado (sem token):', error.message);
  }
}

simulateBrowserFlow().catch(console.error);
