export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8090";

export async function fetchApi(endpoint: string, options?: RequestInit) {
  const url = `${API_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });
    
    // Obtenha o texto da resposta primeiro
    const text = await response.text();
    
    // Tente parsear o JSON apenas se houver conteúdo
    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch (e) {
      console.error("Resposta não é um JSON válido:", text);
      throw new Error("Resposta do servidor não é um JSON válido");
    }
    
    if (!response.ok) {
      throw new Error(data.message || `Erro HTTP: ${response.status} ${response.statusText}`);
    }
    
    return data;
  } catch (error) {
    console.error(`Erro ao acessar ${url}:`, error);
    throw error;
  }
}