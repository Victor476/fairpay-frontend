const API_BASE = 'http://localhost:8090/api';

async function testJoinEndpoint() {
    console.log('🔍 Testando endpoint /groups/join/[token]...\n');

    try {
        // 1. Login
        console.log('1️⃣ Fazendo login...');
        const loginResponse = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'joao.teste@example.com',
                password: 'senha123'
            })
        });

        if (!loginResponse.ok) {
            console.log('❌ Login falhou:', loginResponse.status);
            return;
        }

        const loginData = await loginResponse.json();
        const authToken = loginData.accessToken || loginData.token;
        console.log('✅ Login realizado\n');

        const inviteToken = '22089cee-b200-4dde-bcbd-58e744396a60';

        // 2. Testar GET no endpoint de join
        console.log('2️⃣ Testando GET /groups/join/' + inviteToken);
        
        try {
            const response = await fetch(`${API_BASE}/groups/join/${inviteToken}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('📥 Status:', response.status);
            const responseText = await response.text();
            console.log('📥 Resposta:', responseText);

            if (response.ok) {
                console.log('✅ Endpoint /groups/join/[token] funciona!');
                console.log('💡 Devemos usar este endpoint em vez de /groups/accept-invite');
                return true;
            }
        } catch (error) {
            console.log('❌ Erro:', error.message);
        }

        // 3. Testar POST no endpoint de join
        console.log('\n3️⃣ Testando POST /groups/join/' + inviteToken);
        
        try {
            const response = await fetch(`${API_BASE}/groups/join/${inviteToken}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('📥 Status:', response.status);
            const responseText = await response.text();
            console.log('📥 Resposta:', responseText);

            if (response.ok) {
                console.log('✅ Endpoint POST /groups/join/[token] funciona!');
                console.log('💡 Devemos usar este endpoint em vez de /groups/accept-invite');
                return true;
            }
        } catch (error) {
            console.log('❌ Erro:', error.message);
        }

        console.log('\n❌ Nenhum endpoint de join funcionou');
        return false;

    } catch (error) {
        console.error('❌ Erro geral:', error.message);
        return false;
    }
}

// Executar o teste
testJoinEndpoint();
