import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">Entrar na sua conta</h2>
      
      <form>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:ring-2 focus:outline-none focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Senha
          </label>
          <input
            id="password"
            type="password"
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:ring-2 focus:outline-none focus:border-blue-500 focus:ring-blue-500"
            required
          />
          <div className="mt-1 text-right">
            <a href="#" className="text-sm text-blue-600 hover:underline">
              Esqueceu sua senha?
            </a>
          </div>
        </div>
        
        <button
          type="submit"
          className="w-full inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500 px-4 py-2 text-base"
        >
          Entrar
        </button>
      </form>
      
      <p className="mt-4 text-center text-sm">
        Não tem uma conta?{" "}
        <Link href="/register" className="text-blue-600 hover:underline">
          Cadastre-se
        </Link>
      </p>
    </div>
  );
}