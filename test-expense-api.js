const https = require('https');
const http = require('http');

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlParts = new URL(url);
    const protocol = urlParts.protocol === 'https:' ? https : http;
    
    const requestOptions = {
      hostname: urlParts.hostname,
      port: urlParts.port,
      path: urlParts.pathname + urlParts.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
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

async function testExpenseAPI() {
  console.log('🧪 Testando API de Despesas...\n');

  // 1. Login
  console.log('1️⃣ Fazendo login...');
  const loginResponse = await makeRequest('http://localhost:8090/api/auth/login', {
    method: 'POST',
    body: {
      email: 'joao.teste@example.com',
      password: 'senha123'
    }
  });

  if (loginResponse.status !== 200) {
    console.log('❌ Falha no login');
    return;
  }

  const token = loginResponse.data.accessToken;
  console.log('✅ Login bem-sucedido!\n');

  // 2. Buscar grupos
  console.log('2️⃣ Buscando grupos...');
  const groupsResponse = await makeRequest('http://localhost:8090/api/groups', {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (groupsResponse.status !== 200 || !groupsResponse.data.length) {
    console.log('❌ Nenhum grupo encontrado');
    return;
  }

  const groupId = groupsResponse.data[0].id;
  console.log(`✅ Grupo encontrado: ${groupId}\n`);

  // 3. Buscar membros do grupo
  console.log('3️⃣ Buscando membros do grupo...');
  const membersResponse = await makeRequest(`http://localhost:8090/api/groups/${groupId}/members`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (membersResponse.status !== 200) {
    console.log('❌ Falha ao buscar membros');
    return;
  }

  console.log('✅ Membros encontrados\n');

  // 4. Criar despesa
  console.log('4️⃣ Criando despesa...');
  const expenseData = {
    description: "Teste de Despesa via API",
    totalAmount: 50.0,
    date: "2025-07-03",
    groupId: groupId,
    payer: "joao.teste@example.com",
    participants: ["joao.teste@example.com"]
  };

  const createResponse = await makeRequest('http://localhost:8090/api/expenses', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: expenseData
  });

  if (createResponse.status === 201) {
    console.log('✅ Despesa criada com sucesso!\n');
  } else {
    console.log('❌ Falha ao criar despesa\n');
  }

  // 5. Buscar despesas do grupo
  console.log('5️⃣ Buscando despesas do grupo...');
  const expensesResponse = await makeRequest(`http://localhost:8090/api/expenses/group/${groupId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (expensesResponse.status === 200) {
    console.log(`✅ ${expensesResponse.data.length} despesa(s) encontrada(s)`);
  } else {
    console.log('❌ Falha ao buscar despesas');
  }

  console.log('\n🎉 Teste finalizado!');
}

testExpenseAPI().catch(console.error);
