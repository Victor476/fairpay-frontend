const API_BASE = 'http://localhost:8090/api';

function extractTokenFromUrl(url) {
    // Extrair token do final da URL
    // URL: http://localhost:8090/api/groups/join/6f3faf8d-f9f1-49fd-a015-59555c20a95d
    const parts = url.split('/');
    return parts[parts.length - 1];
}

async function testTokenExtraction() {
    console.log('🔍 Testando extração de token...\n');

    try {
        // 1. Login
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
        const token = loginData.accessToken || loginData.token;
        console.log('✅ Login realizado\n');

        // 2. Buscar grupos existentes
        const groupsResponse = await fetch(`${API_BASE}/groups`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!groupsResponse.ok) {
            console.log('❌ Erro ao buscar grupos');
            return;
        }

        const groups = await groupsResponse.json();
        if (groups.length === 0) {
            console.log('❌ Nenhum grupo encontrado');
            return;
        }

        const group = groups[0];
        console.log('📁 Usando grupo:', group.name, '(ID:', group.id, ')');

        // 3. Gerar convite
        const inviteResponse = await fetch(`${API_BASE}/groups/${group.id}/invite-link`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
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
        console.log('✅ Resposta do backend:');
        console.log('📦 Objeto completo:', JSON.stringify(inviteData, null, 2));
        
        // Extrair token do inviteUrl
        let extractedToken = null;
        if (inviteData.inviteUrl) {
            extractedToken = extractTokenFromUrl(inviteData.inviteUrl);
            console.log('🎯 Token extraído da URL:', extractedToken);
        } else if (inviteData.inviteLink) {
            extractedToken = extractTokenFromUrl(inviteData.inviteLink);
            console.log('🎯 Token extraído da URL:', extractedToken);
        }

        if (extractedToken) {
            console.log('\n🌐 Link para frontend:');
            console.log(`   http://localhost:3000/invite/${extractedToken}`);
            
            // Testar aceitar convite com o token extraído
            console.log('\n4️⃣ Testando aceitação com token extraído...');
            
            const acceptResponse = await fetch(`${API_BASE}/groups/accept-invite`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token: extractedToken })
            });

            console.log('📥 Status:', acceptResponse.status);
            const acceptText = await acceptResponse.text();
            console.log('📥 Resposta:', acceptText);

            if (acceptResponse.ok) {
                console.log('✅ Convite aceito com sucesso!');
            } else {
                console.log('❌ Erro ao aceitar convite');
            }
        }

    } catch (error) {
        console.error('❌ Erro:', error.message);
    }
}

testTokenExtraction();
