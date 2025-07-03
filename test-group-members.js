const API_URL = 'http://localhost:8090';

async function testGroupEndpoint() {
  console.log('🧪 Testando endpoint /api/groups/{id} para verificar membros');
  
  try {
    // 1. Login 
    console.log('\n1️⃣ Fazendo login...');
    const loginResponse = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'a@a.com',
        password: 'a'
      })
    });
    
    const loginData = await loginResponse.json();
    const token = loginData.accessToken;
    console.log('✅ Login realizado');
    
    // 2. Buscar grupos para obter um ID válido
    console.log('\n2️⃣ Buscando grupos disponíveis...');
    const groupsResponse = await fetch(`${API_URL}/api/groups`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const groupsData = await groupsResponse.json();
    console.log('📥 Grupos encontrados:', groupsData.length);
    
    if (groupsData.length > 0) {
      const firstGroup = groupsData[0];
      console.log(`📝 Primeiro grupo: ${firstGroup.name} (ID: ${firstGroup.id})`);
      
      // 3. Buscar detalhes do primeiro grupo
      console.log(`\n3️⃣ Buscando detalhes do grupo ${firstGroup.id}...`);
      const groupDetailResponse = await fetch(`${API_URL}/api/groups/${firstGroup.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const groupDetailData = await groupDetailResponse.json();
      console.log('📥 Status:', groupDetailResponse.status);
      console.log('📥 Resposta completa:', JSON.stringify(groupDetailData, null, 2));
      
      // Verificar se tem membros
      if (groupDetailData.members) {
        console.log(`👥 Membros encontrados: ${groupDetailData.members.length}`);
        groupDetailData.members.forEach((member, index) => {
          console.log(`   ${index + 1}. ${member.name} (${member.email}) - ${member.role || 'member'}`);
        });
      } else {
        console.log('❌ Campo "members" não encontrado na resposta');
        console.log('🔍 Campos disponíveis:', Object.keys(groupDetailData));
      }
      
    } else {
      console.log('⚠️ Nenhum grupo encontrado');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testGroupEndpoint();
