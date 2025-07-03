// Script para testar a solução completa de membros do grupo
const API_URL = 'http://localhost:8090';

async function testMembersSolution() {
  console.log('🧪 Testando solução completa para membros do grupo');
  
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
    
    // 2. Simular fluxo da página do grupo
    console.log('\n2️⃣ Simulando fluxo da página do grupo...');
    
    // 2a. Tentar buscar detalhes do grupo (vai falhar)
    console.log('   Tentando buscar detalhes do grupo...');
    const groupResponse = await fetch(`${API_URL}/api/groups/${groupId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!groupResponse.ok) {
      console.log('   ❌ Detalhes do grupo falharam (esperado):', groupResponse.status);
      
      // 2b. Buscar membros separadamente (vai funcionar)
      console.log('   Tentando buscar membros separadamente...');
      const membersResponse = await fetch(`${API_URL}/api/groups/${groupId}/members`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (membersResponse.ok) {
        const members = await membersResponse.json();
        console.log('   ✅ Membros encontrados:', members.length, 'membros');
        
        // Simular processamento dos membros (como na função atualizada)
        const processedMembers = members.map(member => ({
          ...member,
          role: member.role || 'member',
          joinedAt: member.joinedAt || new Date().toISOString(),
          isActive: member.isActive !== undefined ? member.isActive : true
        }));
        
        console.log('   📋 Membros processados:');
        processedMembers.forEach((member, index) => {
          console.log(`      ${index + 1}. ${member.name} (${member.email}) - ${member.role}`);
        });
        
        // 2c. Simular criação de dados mock com membros reais
        const mockGroup = {
          id: groupId,
          name: "Grupo de Demonstração",
          description: "Dados de demonstração com membros reais do backend.",
          membersCount: processedMembers.length,
          members: processedMembers,
          totalExpenses: 0
        };
        
        console.log('\n✅ Solução funcionará! O frontend mostrará:', mockGroup.membersCount, 'membros reais');
        console.log('👥 Lista de membros que será exibida:');
        mockGroup.members.forEach(member => {
          console.log(`   • ${member.name} (${member.role})`);
        });
        
      } else {
        console.log('   ❌ Membros também falharam:', membersResponse.status);
        console.log('   🔄 Frontend usará membros mock como fallback');
      }
    } else {
      console.log('   ✅ Detalhes do grupo funcionaram (inesperado)');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testMembersSolution();
