// Script para testar a criação de despesas
const API_URL = 'http://localhost:8090';

async function testCreateExpense() {
  console.log('🧪 Testando criação de despesas');
  
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
    
    // 2. Buscar grupos para ter um ID válido
    console.log('\n2️⃣ Buscando grupos...');
    const groupsResponse = await fetch(`${API_URL}/api/groups`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const groups = await groupsResponse.json();
    if (groups.length === 0) {
      console.log('❌ Nenhum grupo encontrado');
      return;
    }
    
    const group = groups[0];
    console.log(`✅ Usando grupo: ${group.name} (ID: ${group.id})`);
    
    // 3. Buscar membros do grupo
    console.log('\n3️⃣ Buscando membros do grupo...');
    const membersResponse = await fetch(`${API_URL}/api/groups/${group.id}/members`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const members = await membersResponse.json();
    console.log('👥 Membros encontrados:', members.length);
    members.forEach(member => {
      console.log(`   • ${member.name} (${member.email})`);
    });
    
    // 4. Testar estruturas de dados diferentes para criar despesa
    const testCases = [
      {
        name: "Formato atual do frontend",
        data: {
          description: "Almoço de teste",
          totalAmount: 50.00,
          date: "2025-07-03",
          groupId: group.id,
          payer: "joao.teste@example.com",
          participants: ["joao.teste@example.com"]
        }
      },
      {
        name: "Formato da especificação (com title)",
        data: {
          title: "Almoço de sábado",
          amount: 180.00,
          date: "2025-04-26",
          paidBy: "João",
          participants: ["João", "Maria"]
        }
      },
      {
        name: "Formato híbrido",
        data: {
          description: "Jantar de teste",
          amount: 75.00,
          expenseDate: "2025-07-03",
          groupId: group.id,
          paidBy: members[0]?.email || "joao.teste@example.com",
          participants: members.map(m => m.email).slice(0, 2)
        }
      }
    ];
    
    for (const testCase of testCases) {
      console.log(`\n4️⃣ Testando: ${testCase.name}`);
      console.log('📋 Dados:', JSON.stringify(testCase.data, null, 2));
      
      const response = await fetch(`${API_URL}/api/expenses`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testCase.data)
      });
      
      console.log(`📥 Status: ${response.status}`);
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Sucesso! Resposta:', JSON.stringify(result, null, 2));
        break; // Se funcionou, parar de testar outros formatos
      } else {
        const errorText = await response.text();
        console.log(`❌ Erro: ${errorText}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testCreateExpense();
