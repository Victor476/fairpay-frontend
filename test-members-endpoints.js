// Script para testar especificamente endpoints de membros
const API_URL = 'http://localhost:8090';

async function testMembersEndpoints() {
  console.log('🧪 Testando endpoints específicos para membros do grupo');
  
  try {
    // 1. Login 
    console.log('\n1️⃣ Fazendo login...');
    const loginResponse = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'joao.teste@example.com',
        password: 'senha123'
      })
    });
    
    const loginData = await loginResponse.json();
    const token = loginData.accessToken;
    console.log('✅ Login realizado');
    
    const groupId = 69; // ID de um grupo que sabemos que existe
    
    // 2. Testar endpoint de membros específico
    const endpoints = [
      `/api/groups/${groupId}/members`,
      `/api/groups/${groupId}/users`,
      `/api/groups/${groupId}/participants`,
      `/api/groups/${groupId}/people`,
      `/api/groups/members/${groupId}`,
      `/api/members/group/${groupId}`
    ];
    
    for (const endpoint of endpoints) {
      console.log(`\n🔍 Testando ${endpoint}...`);
      const response = await fetch(`${API_URL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${endpoint} funciona!`);
        console.log('📥 Dados:', JSON.stringify(data, null, 2));
        
        // Se encontrou membros, parar de testar
        if (Array.isArray(data) && data.length > 0) {
          console.log('🎉 Endpoint funcional encontrado!');
          break;
        }
      } else {
        console.log(`❌ ${endpoint} - Status: ${response.status}`);
        if (response.status !== 404) {
          const errorText = await response.text();
          console.log(`   Erro: ${errorText}`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testMembersEndpoints();
