const API_BASE = 'http://localhost:8090/api';

async function debugAcceptInvite() {
    console.log('🔍 Debugando endpoint de aceitar convite...\n');

    try {
        // 1. Login primeiro
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

        // 2. Testar diferentes formatos de payload
        const inviteToken = '22089cee-b200-4dde-bcbd-58e744396a60';
        
        console.log('2️⃣ Testando diferentes formatos de payload...\n');

        // Teste 1: Formato atual { token: "..." }
        console.log('📝 Teste 1: { token: "' + inviteToken + '" }');
        try {
            const response1 = await fetch(`${API_BASE}/groups/accept-invite`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token: inviteToken })
            });

            console.log('📥 Status:', response1.status);
            const text1 = await response1.text();
            console.log('📥 Resposta:', text1);

            if (response1.ok) {
                console.log('✅ Teste 1 passou!\n');
                return;
            }
        } catch (error) {
            console.log('❌ Erro no Teste 1:', error.message);
        }

        // Teste 2: Formato { inviteToken: "..." }
        console.log('\n📝 Teste 2: { inviteToken: "' + inviteToken + '" }');
        try {
            const response2 = await fetch(`${API_BASE}/groups/accept-invite`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ inviteToken: inviteToken })
            });

            console.log('📥 Status:', response2.status);
            const text2 = await response2.text();
            console.log('📥 Resposta:', text2);

            if (response2.ok) {
                console.log('✅ Teste 2 passou!\n');
                return;
            }
        } catch (error) {
            console.log('❌ Erro no Teste 2:', error.message);
        }

        // Teste 3: String simples
        console.log('\n📝 Teste 3: String simples "' + inviteToken + '"');
        try {
            const response3 = await fetch(`${API_BASE}/groups/accept-invite`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(inviteToken)
            });

            console.log('📥 Status:', response3.status);
            const text3 = await response3.text();
            console.log('📥 Resposta:', text3);

            if (response3.ok) {
                console.log('✅ Teste 3 passou!\n');
                return;
            }
        } catch (error) {
            console.log('❌ Erro no Teste 3:', error.message);
        }

        // Teste 4: Via GET com token na URL
        console.log('\n📝 Teste 4: GET /api/groups/accept-invite/' + inviteToken);
        try {
            const response4 = await fetch(`${API_BASE}/groups/accept-invite/${inviteToken}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('📥 Status:', response4.status);
            const text4 = await response4.text();
            console.log('📥 Resposta:', text4);

            if (response4.ok) {
                console.log('✅ Teste 4 passou!\n');
                return;
            }
        } catch (error) {
            console.log('❌ Erro no Teste 4:', error.message);
        }

        // Teste 5: Via GET com token como query parameter
        console.log('\n📝 Teste 5: GET /api/groups/accept-invite?token=' + inviteToken);
        try {
            const response5 = await fetch(`${API_BASE}/groups/accept-invite?token=${inviteToken}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('📥 Status:', response5.status);
            const text5 = await response5.text();
            console.log('📥 Resposta:', text5);

            if (response5.ok) {
                console.log('✅ Teste 5 passou!\n');
                return;
            }
        } catch (error) {
            console.log('❌ Erro no Teste 5:', error.message);
        }

        console.log('\n❌ Todos os testes falharam. Pode haver um problema no backend.');

    } catch (error) {
        console.error('❌ Erro geral:', error.message);
    }
}

// Executar o debug
debugAcceptInvite();
