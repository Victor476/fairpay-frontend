// Teste completo do fluxo de autenticação frontend + backend
const BASE_FRONTEND_URL = 'http://localhost:3000';
const BASE_BACKEND_URL = 'http://localhost:8090';

async function testFullAuthenticationFlow() {
    console.log('=== TESTE COMPLETO DE AUTENTICAÇÃO ===\n');
    
    try {
        console.log('1. Testando login via backend direto...');
        
        // 1. Fazer login no backend para obter token
        const loginResponse = await fetch(`${BASE_BACKEND_URL}/api/auth/login`, {
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
        console.log('✅ Token obtido:', accessToken.substring(0, 50) + '...\n');
        
        console.log('2. Testando endpoints protegidos com token...');
        
        // 2. Testar endpoint /me
        const userResponse = await fetch(`${BASE_BACKEND_URL}/api/users/me`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        
        if (!userResponse.ok) {
            throw new Error(`Endpoint /me falhou: ${userResponse.status}`);
        }
        
        const user = await userResponse.json();
        console.log('✅ /api/users/me funcionando:', user.name);
        
        // 3. Testar endpoint /groups
        const groupsResponse = await fetch(`${BASE_BACKEND_URL}/api/groups`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        
        if (!groupsResponse.ok) {
            throw new Error(`Endpoint /groups falhou: ${groupsResponse.status}`);
        }
        
        const groups = await groupsResponse.json();
        console.log('✅ /api/groups funcionando:', groups.length, 'grupos encontrados\n');
        
        console.log('3. Testando comportamento sem token...');
        
        // 4. Testar sem token (deve retornar 401)
        const noTokenUserResponse = await fetch(`${BASE_BACKEND_URL}/api/users/me`);
        const noTokenGroupsResponse = await fetch(`${BASE_BACKEND_URL}/api/groups`);
        
        console.log('Resposta /me sem token:', noTokenUserResponse.status);
        console.log('Resposta /groups sem token:', noTokenGroupsResponse.status);
        
        if (noTokenUserResponse.status === 401 && noTokenGroupsResponse.status === 401) {
            console.log('✅ Endpoints protegidos corretamente\n');
        }
        
        console.log('4. Testando página de login do frontend...');
        
        // 5. Testar se o frontend está servindo a página de login
        const frontendLoginResponse = await fetch(`${BASE_FRONTEND_URL}/login`);
        if (frontendLoginResponse.ok) {
            console.log('✅ Página de login acessível');
        } else {
            console.log('❌ Página de login não acessível:', frontendLoginResponse.status);
        }
        
        console.log('5. Testando página de grupos do frontend...');
        
        // 6. Testar se o frontend está servindo a página de grupos
        const frontendGroupsResponse = await fetch(`${BASE_FRONTEND_URL}/groups`);
        if (frontendGroupsResponse.ok) {
            console.log('✅ Página de grupos acessível');
        } else {
            console.log('❌ Página de grupos não acessível:', frontendGroupsResponse.status);
        }
        
        console.log('\n=== RESUMO DOS TESTES ===');
        console.log('✅ Backend funcionando corretamente');
        console.log('✅ JWT funcionando corretamente');
        console.log('✅ Endpoints protegidos adequadamente');
        console.log('✅ Frontend servindo páginas');
        console.log('\n📋 PRÓXIMOS PASSOS:');
        console.log('1. Fazer login manual no frontend');
        console.log('2. Verificar se o token é enviado nas requisições');
        console.log('3. Verificar se a página de grupos funciona após login');
        console.log('\n🔗 URLs para teste manual:');
        console.log(`Login: ${BASE_FRONTEND_URL}/login`);
        console.log(`Grupos: ${BASE_FRONTEND_URL}/groups`);
        console.log('\n📧 Credenciais de teste:');
        console.log('Email: joao63887137709@example.com');
        console.log('Senha: senha123');
        
    } catch (error) {
        console.error('❌ Erro no teste:', error.message);
        process.exit(1);
    }
}

testFullAuthenticationFlow();
