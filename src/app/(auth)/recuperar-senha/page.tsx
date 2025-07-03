"use client";
import { useState } from "react";

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Se esse e-mail estiver cadastrado, enviaremos instruções para: ${email}`);
    setEmail("");
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Recuperar Senha</h1>

        <p className="text-sm text-gray-600 mb-4 text-center">
          Digite seu e-mail e enviaremos instruções para redefinir sua senha.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 p-2 border rounded focus:ring focus:ring-indigo-400 outline-none"
              placeholder="seuemail@exemplo.com"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded transition"
          >
            Enviar instruções
          </button>
        </form>

        <div className="text-sm text-center mt-6">
          <a href="/login" className="text-indigo-600 hover:underline">Voltar para login</a>
        </div>
      </div>
    </main>
  );
}
