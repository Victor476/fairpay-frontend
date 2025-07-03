const axios = require('axios');

const API_URL = 'http://localhost:8090';
const FRONTEND_URL = 'http://localhost:3000';

async function testInviteFlow() {
  console.log('🧪 Testando fluxo completo de convite após mudanças');
  
  try {
    // 1. Login 
    console.log('\n1️⃣ Fazendo login...');
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'a@a.com',
      password: 'a'
    });
    
    const token = loginResponse.data.accessToken;
    console.log('✅ Login realizado');
    
    // 2. Testar aceitação de convite usando a API frontend
    console.log('\n2️⃣ Testando aceitação de convite (simulando frontend)...');
    
    const inviteToken = '22089cee-b200-4dde-bcbd-58e744396a60';
    
    const acceptResponse = await axios.get(`${API_URL}/api/groups/join/${inviteToken}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📥 Status:', acceptResponse.status);
    console.log('📥 Resposta:', JSON.stringify(acceptResponse.data, null, 2));
    
    if (acceptResponse.data.message && acceptResponse.data.group) {
      console.log('✅ Nova estrutura de resposta funciona!');
      console.log(`📝 Mensagem: ${acceptResponse.data.message}`);
      console.log(`👥 Grupo: ${acceptResponse.data.group.name} (ID: ${acceptResponse.data.group.id})`);
    } else {
      console.log('❌ Resposta não tem a estrutura esperada');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.response ? error.response.data : error.message);
  }
}

testInviteFlow();
