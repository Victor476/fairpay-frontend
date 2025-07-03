// Script para testar detalhes do grupo e membros
const API_URL = 'http://localhost:8090';

async function testGroupDetails() {
  console.log('🧪 Testando detalhes do grupo e membros');
  
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
    console.log('📥 Resposta login:', JSON.stringify(loginData, null, 2));
    
    const token = loginData.accessToken;
    if (!token) {
      console.log('❌ Token não encontrado na resposta do login');
      return;
    }
    console.log('✅ Login realizado, token:', token.substring(0, 50) + '...');
    
    // 2. Listar grupos para pegar um ID válido
    console.log('\n2️⃣ Listando grupos...');
    const groupsResponse = await fetch(`${API_URL}/api/groups`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const groupsData = await groupsResponse.json();
    console.log('📥 Resposta grupos completa:', JSON.stringify(groupsData, null, 2));
    
    // Verificar se groupsData é um array ou tem propriedade que contém o array
    let groups = Array.isArray(groupsData) ? groupsData : groupsData.groups || groupsData.data || [];
    
    console.log('📥 Grupos encontrados:', groups.length);
    
    if (groups.length === 0) {
      console.log('❌ Nenhum grupo encontrado para testar');
      return;
    }
    
    const firstGroup = groups[1]; // Testar com o segundo grupo em vez do primeiro
    console.log('🎯 Testando com grupo:', firstGroup.name, '(ID:', firstGroup.id, ')');
    
    // 3. Buscar detalhes do grupo
    console.log('\n3️⃣ Buscando detalhes do grupo...');
    const groupDetailResponse = await fetch(`${API_URL}/api/groups/${firstGroup.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!groupDetailResponse.ok) {
      console.log('❌ Erro na API de detalhes:', groupDetailResponse.status, groupDetailResponse.statusText);
      const errorText = await groupDetailResponse.text();
      console.log('❌ Resposta de erro:', errorText);
      return;
    }
    
    const groupDetail = await groupDetailResponse.json();
    console.log('\n📋 Detalhes do grupo:', JSON.stringify(groupDetail, null, 2));
    
    // 4. Verificar se tem membros
    if (groupDetail.members) {
      console.log('\n👥 Membros encontrados:', groupDetail.members.length);
      groupDetail.members.forEach((member, index) => {
        console.log(`   ${index + 1}. ${member.name} (${member.email}) - ${member.role || 'membro'}`);
      });
    } else {
      console.log('\n❌ Campo "members" não encontrado na resposta');
      console.log('🔍 Campos disponíveis:', Object.keys(groupDetail));
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testGroupDetails();
