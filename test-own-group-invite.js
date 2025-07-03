const API_BASE = 'http://localhost:8090/api';

async function testWithOwnGroup() {
    console.log('🔍 Testando com grupo próprio...\n');

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
            const errorText = await loginResponse.text();
            console.log('❌ Login falhou:', loginResponse.status, errorText);
            return;
        }

        const loginData = await loginResponse.json();
        const token = loginData.accessToken || loginData.token;
        console.log('✅ Login realizado com sucesso\n');

        // 2. Listar grupos do usuário
        console.log('2️⃣ Listando grupos do usuário...');
        const groupsResponse = await fetch(`${API_BASE}/groups`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!groupsResponse.ok) {
            console.log('❌ Erro ao listar grupos:', groupsResponse.status);
            const errorText = await groupsResponse.text();
            console.log('Erro:', errorText);
            
            // Se não conseguir listar grupos, criar um novo
            console.log('\n3️⃣ Criando novo grupo...');
            const createGroupResponse = await fetch(`${API_BASE}/groups`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: 'Grupo Teste Convite',
                    description: 'Grupo para testar funcionalidade de convite'
                })
            });

            if (!createGroupResponse.ok) {
                console.log('❌ Erro ao criar grupo:', createGroupResponse.status);
                const createError = await createGroupResponse.text();
                console.log('Erro:', createError);
                return;
            }

            const newGroup = await createGroupResponse.json();
            console.log('✅ Grupo criado:', newGroup.name, '(ID:', newGroup.id, ')');
            
            // Tentar gerar convite no grupo recém-criado
            console.log('\n4️⃣ Gerando convite no grupo próprio...');
            const inviteResponse = await fetch(`${API_BASE}/groups/${newGroup.id}/invite-link`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ expiresInDays: 7 })
            });

            console.log('📥 Status:', inviteResponse.status);
            const inviteResponseText = await inviteResponse.text();
            console.log('📥 Resposta:', inviteResponseText);

            if (inviteResponse.ok) {
                console.log('✅ Link de convite gerado com sucesso!');
                const inviteData = JSON.parse(inviteResponseText);
                console.log('🔗 URL:', inviteData.inviteUrl || inviteData.inviteLink);
                console.log('⏰ Expira:', inviteData.expiresAt);
            } else {
                console.log('❌ Falha ao gerar convite no grupo próprio');
            }
            
            return;
        }

        const groups = await groupsResponse.json();
        console.log('✅ Grupos encontrados:', groups.length);
        
        if (groups.length === 0) {
            console.log('⚠️ Usuário não tem grupos. Criando um...');
            
            const createGroupResponse = await fetch(`${API_BASE}/groups`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: 'Meu Grupo Teste',
                    description: 'Grupo criado para teste de convite'
                })
            });

            if (!createGroupResponse.ok) {
                console.log('❌ Erro ao criar grupo');
                return;
            }

            const newGroup = await createGroupResponse.json();
            groups.push(newGroup);
            console.log('✅ Grupo criado:', newGroup.name);
        }

        // 3. Usar o primeiro grupo (que deve ser do usuário)
        const myGroup = groups[0];
        console.log('📁 Usando grupo:', myGroup.name, '(ID:', myGroup.id, ')');
        console.log('👤 Criado por:', myGroup.createdBy?.name || 'N/A\n');

        // 4. Tentar gerar convite
        console.log('3️⃣ Gerando convite...');
        const inviteResponse = await fetch(`${API_BASE}/groups/${myGroup.id}/invite-link`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ expiresInDays: 7 })
        });

        console.log('📥 Status:', inviteResponse.status);
        const inviteResponseText = await inviteResponse.text();
        console.log('📥 Resposta bruta:', inviteResponseText);

        if (inviteResponse.ok) {
            console.log('✅ Link de convite gerado com sucesso!');
            const inviteData = JSON.parse(inviteResponseText);
            console.log('🔗 URL:', inviteData.inviteUrl || inviteData.inviteLink);
            console.log('⏰ Expira:', inviteData.expiresAt);
            
            console.log('\n🎉 Teste bem-sucedido! A funcionalidade funciona quando o usuário é o criador do grupo.');
        } else {
            console.log('❌ Falha ao gerar convite mesmo sendo o criador do grupo');
            console.log('Isso indica um problema no backend ou na implementação');
        }

    } catch (error) {
        console.error('❌ Erro geral:', error.message);
    }
}

// Executar o teste
testWithOwnGroup();
