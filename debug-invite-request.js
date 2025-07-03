const API_BASE = 'http://localhost:8090/api';

async function debugInviteRequest() {
    console.log('🔍 Debugando requisição de convite...\n');

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
            const errorText = await loginResponse.text();
            console.log('❌ Login falhou:', loginResponse.status, errorText);
            return;
        }

        const loginData = await loginResponse.json();
        const token = loginData.accessToken || loginData.token;
        console.log('✅ Login realizado com sucesso');
        console.log('🎫 Token:', token ? token.substring(0, 50) + '...' : 'Token não encontrado', '\n');

        // 2. Tentar gerar link de convite com diferentes payloads
        const groupId = 71;
        
        console.log('2️⃣ Testando diferentes payloads...\n');
        
        // Teste 1: Payload simples
        console.log('📝 Teste 1: Payload { expiresInDays: 7 }');
        const payload1 = { expiresInDays: 7 };
        console.log('📤 Enviando:', JSON.stringify(payload1));
        
        try {
            const response1 = await fetch(`${API_BASE}/groups/${groupId}/invite-link`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload1)
            });

            console.log('📥 Status:', response1.status);
            console.log('📥 Headers:', Object.fromEntries(response1.headers.entries()));
            
            const responseText = await response1.text();
            console.log('📥 Resposta bruta:', responseText);
            
            if (response1.ok) {
                console.log('✅ Teste 1 passou!\n');
                return;
            } else {
                console.log('❌ Teste 1 falhou\n');
            }
        } catch (error) {
            console.log('❌ Erro no Teste 1:', error.message, '\n');
        }

        // Teste 2: Payload vazio
        console.log('📝 Teste 2: Payload vazio {}');
        const payload2 = {};
        console.log('📤 Enviando:', JSON.stringify(payload2));
        
        try {
            const response2 = await fetch(`${API_BASE}/groups/${groupId}/invite-link`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload2)
            });

            console.log('📥 Status:', response2.status);
            const responseText2 = await response2.text();
            console.log('📥 Resposta bruta:', responseText2);
            
            if (response2.ok) {
                console.log('✅ Teste 2 passou!\n');
                return;
            } else {
                console.log('❌ Teste 2 falhou\n');
            }
        } catch (error) {
            console.log('❌ Erro no Teste 2:', error.message, '\n');
        }

        // Teste 3: Sem body
        console.log('📝 Teste 3: Sem body');
        
        try {
            const response3 = await fetch(`${API_BASE}/groups/${groupId}/invite-link`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('📥 Status:', response3.status);
            const responseText3 = await response3.text();
            console.log('📥 Resposta bruta:', responseText3);
            
            if (response3.ok) {
                console.log('✅ Teste 3 passou!\n');
                return;
            } else {
                console.log('❌ Teste 3 falhou\n');
            }
        } catch (error) {
            console.log('❌ Erro no Teste 3:', error.message, '\n');
        }

        // Teste 4: Payload com validInDays em vez de expiresInDays
        console.log('📝 Teste 4: Payload { validInDays: 7 }');
        const payload4 = { validInDays: 7 };
        console.log('📤 Enviando:', JSON.stringify(payload4));
        
        try {
            const response4 = await fetch(`${API_BASE}/groups/${groupId}/invite-link`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload4)
            });

            console.log('📥 Status:', response4.status);
            const responseText4 = await response4.text();
            console.log('📥 Resposta bruta:', responseText4);
            
            if (response4.ok) {
                console.log('✅ Teste 4 passou!\n');
                return;
            } else {
                console.log('❌ Teste 4 falhou\n');
            }
        } catch (error) {
            console.log('❌ Erro no Teste 4:', error.message, '\n');
        }

        console.log('🔍 Verificando se o grupo existe...');
        
        // Verificar se o grupo existe
        try {
            const groupResponse = await fetch(`${API_BASE}/groups/${groupId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('📥 Status do grupo:', groupResponse.status);
            if (groupResponse.ok) {
                const groupData = await groupResponse.json();
                console.log('✅ Grupo existe:', groupData.name);
            } else {
                const groupError = await groupResponse.text();
                console.log('❌ Grupo não encontrado:', groupError);
            }
        } catch (error) {
            console.log('❌ Erro ao verificar grupo:', error.message);
        }

    } catch (error) {
        console.error('❌ Erro geral:', error.message);
    }
}

// Executar o debug
debugInviteRequest();
