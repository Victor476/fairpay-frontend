// Função alternativa usando XMLHttpRequest para testar CORS
export function testXHR(url: string, token?: string) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }
    xhr.setRequestHeader('Content-Type', 'application/json');
    
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        console.log('XHR Status:', xhr.status);
        console.log('XHR Response:', xhr.responseText);
        
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText || '{}'));
        } else {
          reject(new Error(`XHR Error: ${xhr.status} ${xhr.statusText}`));
        }
      }
    };
    
    xhr.onerror = function() {
      console.error('XHR Network Error');
      reject(new Error('XHR Network Error'));
    };
    
    xhr.send();
  });
}

// Adicionar ao window para teste
if (typeof window !== 'undefined') {
  (window as any).testXHR = testXHR;
}
