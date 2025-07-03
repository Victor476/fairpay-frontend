// Teste para verificar o problema de token no frontend
console.log('=== TESTE DE DEBUG DE TOKEN NO FRONTEND ===');

// Simular localStorage
const mockLocalStorage = {
    store: {},
    getItem: function(key) {
        const value = this.store[key] || null;
        console.log(`localStorage.getItem("${key}") =>`, value ? value.substring(0, 30) + '...' : 'null');
        return value;
    },
    setItem: function(key, value) {
        console.log(`localStorage.setItem("${key}", "${value.substring(0, 30)}...")`);
        this.store[key] = value;
    },
    removeItem: function(key) {
        console.log(`localStorage.removeItem("${key}")`);
        delete this.store[key];
    }
};

// Simular o comportamento do tokenUtils
const tokenUtils = {
    getAccessToken: () => {
        if (typeof window === 'undefined') return null;
        const token = mockLocalStorage.getItem('fairpay_access_token');
        console.log('tokenUtils.getAccessToken: Token recuperado:', token ? token.substring(0, 20) + '...' : 'null');
        return token;
    },
    setTokens: (accessToken, refreshToken) => {
        console.log('tokenUtils.setTokens: Salvando tokens...');
        console.log('tokenUtils.setTokens: Access Token:', accessToken?.substring(0, 20) + '...');
        console.log('tokenUtils.setTokens: Refresh Token:', refreshToken?.substring(0, 20) + '...');
        
        mockLocalStorage.setItem('fairpay_access_token', accessToken);
        mockLocalStorage.setItem('fairpay_refresh_token', refreshToken);
        
        // Verificar se foi salvo
        const saved = mockLocalStorage.getItem('fairpay_access_token');
        console.log('tokenUtils.setTokens: Token salvo verificação:', saved ? saved.substring(0, 20) + '...' : 'null');
    }
};

// Simular fetchApi com logs detalhados
async function fetchApi(endpoint, options) {
    console.log(`\n=== fetchApi("${endpoint}") ===`);
    
    // Obter token
    let token = tokenUtils.getAccessToken();
    console.log('fetchApi: Token obtido:', token ? token.substring(0, 50) + '...' : 'null');
    
    const headers = {
        "Content-Type": "application/json",
    };
    
    if (token) {
        headers.Authorization = `Bearer ${token}`;
        console.log('fetchApi: Adicionando Authorization header com token válido');
    } else {
        console.warn('fetchApi: Nenhum token válido disponível');
    }
    
    console.log('fetchApi: Headers finais:', Object.keys(headers));
    
    return headers; // Retornar headers para teste
}

async function testTokenFlow() {
    console.log('\n1. Simulando login...');
    
    // Simular resposta de login
    const loginResponse = {
        accessToken: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJqb2FvNjM4ODcxMzc3MDlAZXhhbXBsZS5jb20iLCJpYXQiOjE3NTE1NTE3MTAsImV4cCI6MTc1MTU1NTMxMCwidXNlcklkIjo4Nn0.apSglyOwGe-djyrOgOluaDkiE5GU2sqrmcAioTKBJ_M',
        refreshToken: '3fd9d8b6-a00a-4f68-87e3-a0a4ffd59403'
    };
    
    // Salvar tokens
    tokenUtils.setTokens(loginResponse.accessToken, loginResponse.refreshToken);
    
    console.log('\n2. Testando requisições subsequentes...');
    
    // Primeira requisição
    console.log('\n--- Primeira requisição (/api/users/me) ---');
    const headers1 = await fetchApi('/api/users/me');
    
    // Segunda requisição
    console.log('\n--- Segunda requisição (/api/groups) ---');
    const headers2 = await fetchApi('/api/groups');
    
    // Terceira requisição
    console.log('\n--- Terceira requisição (/api/groups) novamente ---');
    const headers3 = await fetchApi('/api/groups');
    
    console.log('\n=== RESUMO ===');
    console.log('Todas as requisições incluíram Authorization header?', 
        headers1.Authorization && headers2.Authorization && headers3.Authorization);
}

testTokenFlow();
