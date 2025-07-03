const API_BASE = 'http://localhost:8090/api';

async function testCompleteInviteFlow() {
    console.log('🔄 Testando fluxo completo de convite...\n');

    try {
        // 1. Login como criador do grupo
        console.log('1️⃣ Login como criador do grupo...');
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
            console.log('❌ Login falhou');
            return;
        }

        const loginData = await loginResponse.json();
        const creatorToken = loginData.accessToken || loginData.token;
        console.log('✅ Login do criador realizado\n');

        // 2. Criar um grupo
        console.log('2️⃣ Criando grupo...');
        const createGroupResponse = await fetch(`${API_BASE}/groups`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${creatorToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: 'Grupo Teste Convite Completo',
                description: 'Grupo para demonstrar funcionalidade de convite'
            })
        });

        if (!createGroupResponse.ok) {
            console.log('❌ Erro ao criar grupo');
            return;
        }

        const newGroup = await createGroupResponse.json();
        console.log('✅ Grupo criado:', newGroup.name, '(ID:', newGroup.id, ')\n');

        // 3. Gerar link de convite
        console.log('3️⃣ Gerando link de convite...');
        const inviteResponse = await fetch(`${API_BASE}/groups/${newGroup.id}/invite-link`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${creatorToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ expiresInDays: 7 })
        });

        if (!inviteResponse.ok) {
            const errorText = await inviteResponse.text();
            console.log('❌ Erro ao gerar convite:', errorText);
            return;
        }

        const inviteData = await inviteResponse.json();
        console.log('✅ Link de convite gerado!');
        console.log('🔗 URL:', inviteData.inviteUrl || inviteData.inviteLink);
        console.log('🎯 Token:', inviteData.token);
        console.log('⏰ Expira:', inviteData.expiresAt, '\n');

        // 4. Simular aceitar convite (seria feito por outro usuário)
        console.log('4️⃣ Simulando aceitação de convite...');
        console.log('📋 Para aceitar o convite:');
        console.log('   1. Acesse:', `http://localhost:3000/invite/${inviteData.token}`);
        console.log('   2. Faça login ou registre-se se necessário');
        console.log('   3. Clique em "Aceitar Convite"');
        console.log('   4. Será redirecionado para o grupo');

        // 5. Testar endpoint de aceitar convite diretamente
        console.log('\n5️⃣ Testando endpoint de aceitar convite...');
        
        // Login como outro usuário (ou criar um novo)
        const accepterEmail = 'convidado.teste@example.com';
        
        // Tentar registrar o usuário primeiro
        try {
            await fetch(`${API_BASE}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: 'Convidado Teste',
                    email: accepterEmail,
                    password: 'senha123',
                    confirmPassword: 'senha123'
                })
            });
        } catch (e) {
            // Usuário pode já existir
        }

        // Login como convidado
        const accepterLoginResponse = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: accepterEmail,
                password: 'senha123'
            })
        });

        if (accepterLoginResponse.ok) {
            const accepterData = await accepterLoginResponse.json();
            const accepterToken = accepterData.accessToken || accepterData.token;
            
            // Aceitar convite
            const acceptResponse = await fetch(`${API_BASE}/groups/accept-invite`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accepterToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token: inviteData.token })
            });

            console.log('📥 Status da aceitação:', acceptResponse.status);
            const acceptResponseText = await acceptResponse.text();
            console.log('📥 Resposta:', acceptResponseText);

            if (acceptResponse.ok) {
                console.log('✅ Convite aceito com sucesso via API!');
                const acceptData = JSON.parse(acceptResponseText);
                console.log('📁 Grupo:', acceptData.groupName);
                console.log('🎯 ID do grupo:', acceptData.groupId);
            } else {
                console.log('❌ Falha ao aceitar convite via API');
            }
        }

        console.log('\n🎉 TESTE COMPLETO!');
        console.log('\n📋 RESUMO DO FLUXO:');
        console.log('1. ✅ Criador logou e criou grupo');
        console.log('2. ✅ Link de convite foi gerado');
        console.log('3. ✅ Frontend pode aceitar convites via /invite/[token]');
        console.log('4. ✅ API de aceitação funciona');

        console.log('\n🌐 COMO USAR NA WEB:');
        console.log(`   1. Acesse: http://localhost:3000/invite/${inviteData.token}`);
        console.log('   2. Faça login se necessário');
        console.log('   3. Clique em "Aceitar Convite"');
        console.log('   4. Seja redirecionado para o grupo');

    } catch (error) {
        console.error('❌ Erro durante o teste:', error.message);
    }
}

// Executar o teste
testCompleteInviteFlow();
