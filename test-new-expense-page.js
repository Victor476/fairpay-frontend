// Script para testar a tela de criação de despesa
const API_URL = 'http://localhost:8090';

async function testNewExpensePage() {
  console.log('🧪 Testando funcionalidade da tela de nova despesa');
  
  try {
    // 1. Login 
    console.log('\n1️⃣ Fazendo login...');
    const loginResponse = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'a@a.com',
        password: 'a'
      })
    });
    
    if (!loginResponse.ok) {
      console.log('❌ Login falhou, tentando com outro usuário...');
      
      const loginResponse2 = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'joao.teste@example.com',
          password: 'senha123'
        })
      });
      
      if (!loginResponse2.ok) {
        console.log('❌ Login com segundo usuário também falhou');
        return;
      }
      
      const loginData = await loginResponse2.json();
      var token = loginData.accessToken;
      var userEmail = 'joao.teste@example.com';
    } else {
      const loginData = await loginResponse.json();
      var token = loginData.accessToken;
      var userEmail = 'a@a.com';
    }
    
    console.log('✅ Login realizado com:', userEmail);
    
    const groupId = 70; // ID do grupo que está causando erro
    
    // 2. Testar cenário da tela de nova despesa
    console.log(`\n2️⃣ Simulando carregamento da tela de nova despesa para grupo ${groupId}...`);
    
    // 2a. Tentar fetchGroupById (vai falhar)
    console.log('   Testando fetchGroupById...');
    const groupResponse = await fetch(`${API_URL}/api/groups/${groupId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (groupResponse.ok) {
      console.log('   ✅ fetchGroupById funcionou inesperadamente');
      const groupData = await groupResponse.json();
      console.log('   📋 Dados do grupo:', groupData);
    } else {
      console.log(`   ❌ fetchGroupById falhou (esperado): ${groupResponse.status}`);
      
      // 2b. Testar fetchGroupMembers (deve funcionar)
      console.log('   Testando fetchGroupMembers como fallback...');
      const membersResponse = await fetch(`${API_URL}/api/groups/${groupId}/members`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (membersResponse.ok) {
        const members = await membersResponse.json();
        console.log('   ✅ fetchGroupMembers funcionou!');
        console.log(`   👥 ${members.length} membro(s) encontrado(s):`);
        members.forEach(member => {
          console.log(`      • ${member.name} (${member.email})`);
        });
        
        // Verificar se o usuário atual está na lista
        const currentUser = members.find(m => m.email === userEmail);
        if (currentUser) {
          console.log(`   ✅ Usuário atual encontrado na lista: ${currentUser.name}`);
        } else {
          console.log(`   ⚠️ Usuário atual (${userEmail}) não encontrado na lista de membros`);
        }
        
      } else {
        console.log(`   ❌ fetchGroupMembers também falhou: ${membersResponse.status}`);
        const errorText = await membersResponse.text();
        console.log('   Erro:', errorText);
      }
    }
    
    // 3. Testar criação de despesa para este grupo
    console.log('\n3️⃣ Testando criação de despesa...');
    const expenseData = {
      description: "Teste de despesa na tela",
      totalAmount: 25.50,
      date: "2025-07-03",
      groupId: groupId,
      payer: userEmail,
      participants: [userEmail]
    };
    
    console.log('📋 Dados da despesa:', JSON.stringify(expenseData, null, 2));
    
    const createResponse = await fetch(`${API_URL}/api/expenses`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(expenseData)
    });
    
    if (createResponse.ok) {
      const result = await createResponse.json();
      console.log('✅ Despesa criada com sucesso!');
      console.log('📄 Resultado:', JSON.stringify(result, null, 2));
    } else {
      console.log(`❌ Falha ao criar despesa: ${createResponse.status}`);
      const errorText = await createResponse.text();
      console.log('Erro:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testNewExpensePage();
