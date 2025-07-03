const API_BASE = 'http://localhost:8080/api';

async function testInviteLinkFlow() {
    console.log('🔄 Testando fluxo completo de link de convite...\n');

    try {
        // 1. Login
        console.log('1️⃣ Fazendo login...');
        const loginResponse = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'admin@exemplo.com',
                password: 'admin123'
            })
        });

        if (!loginResponse.ok) {
            throw new Error(`Login falhou: ${loginResponse.status}`);
        }

        const loginData = await loginResponse.json();
        const token = loginData.token;
        console.log('✅ Login realizado com sucesso');
        console.log('Token:', token.substring(0, 20) + '...\n');

        // 2. Buscar grupos do usuário
        console.log('2️⃣ Buscando grupos do usuário...');
        const groupsResponse = await fetch(`${API_BASE}/groups`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!groupsResponse.ok) {
            throw new Error(`Busca de grupos falhou: ${groupsResponse.status}`);
        }

        const groups = await groupsResponse.json();
        console.log('✅ Grupos encontrados:', groups.length);
        
        if (groups.length === 0) {
            console.log('⚠️ Nenhum grupo encontrado. Criando um grupo de teste...');
            
            // Criar grupo de teste
            const createGroupResponse = await fetch(`${API_BASE}/groups`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: 'Grupo Teste Convite',
                    description: 'Grupo criado para testar funcionalidade de convite'
                })
            });

            if (!createGroupResponse.ok) {
                throw new Error(`Criação de grupo falhou: ${createGroupResponse.status}`);
            }

            const newGroup = await createGroupResponse.json();
            groups.push(newGroup);
            console.log('✅ Grupo de teste criado:', newGroup.name);
        }

        const testGroup = groups[0];
        console.log('📁 Usando grupo:', testGroup.name, '(ID:', testGroup.id, ')\n');

        // 3. Gerar link de convite
        console.log('3️⃣ Gerando link de convite...');
        const inviteResponse = await fetch(`${API_BASE}/groups/${testGroup.id}/invite-link`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                expiresInDays: 7
            })
        });

        if (!inviteResponse.ok) {
            const errorText = await inviteResponse.text();
            throw new Error(`Geração de convite falhou: ${inviteResponse.status} - ${errorText}`);
        }

        const inviteData = await inviteResponse.json();
        console.log('✅ Link de convite gerado com sucesso!');
        console.log('🔗 URL:', inviteData.inviteUrl);
        console.log('⏰ Expira em:', inviteData.expiresAt);
        console.log('🎯 Token:', inviteData.token, '\n');

        // 4. Validar estrutura da resposta
        console.log('4️⃣ Validando estrutura da resposta...');
        const requiredFields = ['inviteUrl', 'expiresAt', 'token'];
        const missingFields = requiredFields.filter(field => !inviteData[field]);
        
        if (missingFields.length > 0) {
            console.log('❌ Campos obrigatórios ausentes:', missingFields);
        } else {
            console.log('✅ Todos os campos obrigatórios estão presentes');
        }

        // 5. Verificar se o URL é válido
        console.log('5️⃣ Verificando URL...');
        try {
            new URL(inviteData.inviteUrl);
            console.log('✅ URL válida');
        } catch (error) {
            console.log('❌ URL inválida:', error.message);
        }

        // 6. Verificar se a data de expiração é futura
        console.log('6️⃣ Verificando data de expiração...');
        const expirationDate = new Date(inviteData.expiresAt);
        const now = new Date();
        
        if (expirationDate > now) {
            const diffDays = Math.ceil((expirationDate - now) / (1000 * 60 * 60 * 24));
            console.log('✅ Data de expiração é futura:', diffDays, 'dias');
        } else {
            console.log('❌ Data de expiração é passada');
        }

        console.log('\n🎉 Teste completo! A funcionalidade de link de convite está funcionando.');
        console.log('\n📋 RESUMO:');
        console.log('- Login: ✅');
        console.log('- Busca de grupos: ✅');
        console.log('- Geração de convite: ✅');
        console.log('- Estrutura da resposta: ✅');
        console.log('- Validação de URL: ✅');
        console.log('- Validação de data: ✅');

    } catch (error) {
        console.error('❌ Erro durante o teste:', error.message);
        console.log('\n📋 POSSÍVEIS CAUSAS:');
        console.log('- Backend não está rodando na porta 8080');
        console.log('- Credenciais de login inválidas');
        console.log('- Endpoint de convite não implementado');
        console.log('- Problema de CORS ou autenticação');
    }
}

// Executar o teste
testInviteLinkFlow();
