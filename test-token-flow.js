// Teste para verificar o fluxo de token JWT
async function testTokenFlow() {
    const BASE_URL = 'http://localhost:3000';
    
    console.log('=== TESTE DE FLUXO DE TOKEN JWT ===\n');
    
    try {
        // 1. Verificar se o frontend está rodando
        console.log('1. Verificando frontend...');
        const frontendResponse = await fetch(BASE_URL);
        if (!frontendResponse.ok) {
            throw new Error('Frontend não está rodando');
        }
        console.log('✅ Frontend está rodando\n');
        
        // 2. Simular login via API do backend
        console.log('2. Fazendo login via backend...');
        const loginResponse = await fetch('http://localhost:8090/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'joao63887137709@example.com',
                password: 'senha123'
            })
        });
        
        if (!loginResponse.ok) {
            throw new Error(`Login falhou: ${loginResponse.status}`);
        }
        
        const { accessToken } = await loginResponse.json();
        console.log('✅ Login realizado com sucesso');
        console.log('Token recebido:', accessToken.substring(0, 50) + '...\n');
        
        // 3. Testar requisição /me com token
        console.log('3. Testando endpoint /me com token...');
        const userResponse = await fetch('http://localhost:8090/api/users/me', {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        
        if (!userResponse.ok) {
            throw new Error(`Endpoint /me falhou: ${userResponse.status}`);
        }
        
        const user = await userResponse.json();
        console.log('✅ Endpoint /me funcionando');
        console.log('Usuário:', user, '\n');
        
        // 4. Testar requisição de grupos com token
        console.log('4. Testando endpoint /groups com token...');
        const groupsResponse = await fetch('http://localhost:8090/api/groups', {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        
        if (!groupsResponse.ok) {
            throw new Error(`Endpoint /groups falhou: ${groupsResponse.status}`);
        }
        
        const groups = await groupsResponse.json();
        console.log('✅ Endpoint /groups funcionando');
        console.log('Grupos:', groups.length, 'encontrados\n');
        
        // 5. Testar requisições sem token
        console.log('5. Testando requisições sem token...');
        
        const noTokenUserResponse = await fetch('http://localhost:8090/api/users/me');
        console.log('Resposta /me sem token:', noTokenUserResponse.status);
        
        const noTokenGroupsResponse = await fetch('http://localhost:8090/api/groups');
        console.log('Resposta /groups sem token:', noTokenGroupsResponse.status);
        
        if (noTokenUserResponse.status === 401 && noTokenGroupsResponse.status === 401) {
            console.log('✅ Endpoints protegidos corretamente\n');
        } else {
            console.log('⚠️ Endpoints podem não estar protegidos corretamente\n');
        }
        
        console.log('=== TESTE CONCLUÍDO COM SUCESSO ===');
        
    } catch (error) {
        console.error('❌ Erro no teste:', error.message);
        process.exit(1);
    }
}

testTokenFlow();
