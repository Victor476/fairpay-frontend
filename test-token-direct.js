// Simular um token válido
const testToken = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJqb2FvNjM4ODcxMzMzOThAZXhhbXBsZS5jb20iLCJpYXQiOjE3NTE1NDczOTksImV4cCI6MTc1MTU0ODI5OSwidXNlcklkIjo3OX0.czjFJVFnLp_q01TzDE6cq59IFB-HBliCZkjCxUlzlA";

console.log('=== Teste de Token ===');

console.log('Testando requisição simples...');

async function testDirectRequest() {
    try {
        console.log('Fazendo requisição para /api/users/me...');
        const response = await fetch('http://localhost:8090/api/users/me', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${testToken}`
            },
            mode: 'cors',
            credentials: 'omit'
        });
        
        console.log('Status:', response.status);
        console.log('Headers enviados:', {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${testToken.substring(0, 20)}...`
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Resposta bem-sucedida:', data);
        } else {
            const errorText = await response.text();
            console.log('❌ Erro:', errorText);
        }
    } catch (error) {
        console.error('❌ Erro na requisição:', error.message);
    }
}

testDirectRequest();
