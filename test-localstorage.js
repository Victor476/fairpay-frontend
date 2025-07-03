// Teste para verificar se o localStorage está sendo usado no frontend
console.log('=== TESTE DE LOCALSTORAGE NO FRONTEND ===\n');

// Simular o comportamento do navegador
function testLocalStorageInBrowser() {
    console.log('1. Testando localStorage no navegador...');
    
    // Simular salvamento de token
    const testToken = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0ZUBleGFtcGxlLmNvbSIsImlhdCI6MTY4ODEyMzQ1NiwiZXhwIjoxNjg4MjA5ODU2fQ.test';
    
    try {
        // Tentar acessar localStorage
        if (typeof localStorage !== 'undefined') {
            console.log('✅ localStorage está disponível');
            
            // Salvar token
            localStorage.setItem('fairpay_access_token', testToken);
            console.log('✅ Token salvo no localStorage');
            
            // Recuperar token
            const retrievedToken = localStorage.getItem('fairpay_access_token');
            console.log('✅ Token recuperado:', retrievedToken ? retrievedToken.substring(0, 30) + '...' : 'null');
            
            // Limpar teste
            localStorage.removeItem('fairpay_access_token');
            console.log('✅ Token removido');
            
            return true;
        } else {
            console.log('❌ localStorage não está disponível');
            return false;
        }
    } catch (error) {
        console.log('❌ Erro ao acessar localStorage:', error.message);
        return false;
    }
}

// Testar acesso direto via fetch para o frontend
async function testFrontendAPICall() {
    console.log('\n2. Testando chamada direta para o frontend...');
    
    try {
        // Fazer uma requisição para o frontend para ver se ele está processando
        const response = await fetch('http://localhost:3000/api/test', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Resposta do frontend:', response.status, response.statusText);
        
        if (response.status === 404) {
            console.log('✅ Frontend está respondendo (404 é esperado para rota inexistente)');
        }
        
    } catch (error) {
        console.log('❌ Erro ao conectar com frontend:', error.message);
    }
}

// Executar testes
async function runTests() {
    const localStorageWorks = testLocalStorageInBrowser();
    await testFrontendAPICall();
    
    console.log('\n=== INSTRUÇÕES PARA TESTE MANUAL ===');
    console.log('1. Abra o DevTools do navegador (F12)');
    console.log('2. Vá para a aba Console');
    console.log('3. Execute os seguintes comandos:');
    console.log('');
    console.log('// Verificar se há token salvo:');
    console.log('localStorage.getItem("fairpay_access_token")');
    console.log('');
    console.log('// Salvar um token de teste:');
    console.log('localStorage.setItem("fairpay_access_token", "test-token-123")');
    console.log('');
    console.log('// Verificar novamente:');
    console.log('localStorage.getItem("fairpay_access_token")');
    console.log('');
    console.log('// Fazer login e verificar se o token é salvo:');
    console.log('// (Após fazer login, execute novamente o comando de verificação)');
    console.log('');
    console.log('=== URLs PARA TESTE ===');
    console.log('Login: http://localhost:3000/login');
    console.log('Grupos: http://localhost:3000/groups');
    console.log('');
    console.log('Credenciais de teste:');
    console.log('Email: joao63887137709@example.com');
    console.log('Senha: senha123');
}

runTests();
