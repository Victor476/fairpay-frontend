// Script para testar a API de registro de pagamentos
const API_URL = 'http://localhost:8090';

async function testPaymentAPI() {
  console.log('🧪 Testando API de registro de pagamentos');
  
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
    
    if (!membersResponse.ok) {
      console.log('❌ Falha ao buscar membros:', membersResponse.status);
      return;
    }
    
    const members = await membersResponse.json();
    console.log('👥 Membros encontrados:', members.length);
    members.forEach(member => {
      console.log(`   • ${member.name} (ID: ${member.id})`);
    });
    
    if (members.length < 2) {
      console.log('⚠️ Precisa de pelo menos 2 membros para testar pagamento. Criando dados mock...');
      
      // Simular com dados mock
      const paymentData = {
        fromUserId: members[0]?.id || 1,
        toUserId: members[0]?.id + 1 || 2, // ID diferente
        amount: 50.00,
        date: "2025-07-03",
        description: "Pagamento de teste"
      };
      
      console.log('\n4️⃣ Testando endpoint de pagamento (pode falhar devido a IDs mock)...');
      console.log('📋 Dados:', JSON.stringify(paymentData, null, 2));
      
    } else {
      // Teste real com membros existentes
      const paymentData = {
        fromUserId: members[0].id,
        toUserId: members[1].id,
        amount: 75.50,
        date: "2025-07-03",
        description: "Pagamento pelo jantar de sexta"
      };
      
      console.log('\n4️⃣ Testando endpoint de pagamento...');
      console.log('📋 Dados:', JSON.stringify(paymentData, null, 2));
      
      const paymentResponse = await fetch(`${API_URL}/api/groups/${group.id}/payments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentData)
      });
      
      console.log(`📥 Status: ${paymentResponse.status}`);
      
      if (paymentResponse.ok) {
        const result = await paymentResponse.json();
        console.log('✅ Pagamento registrado com sucesso!');
        console.log('📄 Resultado:', JSON.stringify(result, null, 2));
      } else {
        const errorText = await paymentResponse.text();
        console.log(`❌ Falha ao registrar pagamento: ${errorText}`);
      }
    }
    
    // 5. Testar estruturas de dados alternativas
    console.log('\n5️⃣ Testando formatos alternativos...');
    
    const testCases = [
      {
        name: "Sem descrição",
        data: {
          fromUserId: members[0]?.id || 1,
          toUserId: members[1]?.id || 2,
          amount: 25.00
        }
      },
      {
        name: "Sem data",
        data: {
          fromUserId: members[0]?.id || 1,
          toUserId: members[1]?.id || 2,
          amount: 30.00,
          description: "Teste sem data"
        }
      }
    ];
    
    for (const testCase of testCases) {
      console.log(`\n   📋 ${testCase.name}:`, JSON.stringify(testCase.data, null, 2));
      
      const response = await fetch(`${API_URL}/api/groups/${group.id}/payments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testCase.data)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log(`   ✅ ${testCase.name} funcionou!`);
      } else {
        console.log(`   ❌ ${testCase.name} falhou: ${response.status}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testPaymentAPI();
