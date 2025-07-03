"use client";
import { useState } from "react";

export default function ConfiguracoesConta() {
  const [nome, setNome] = useState("Guilherme");
  const [email, setEmail] = useState("gui@email.com");
  const [senha, setSenha] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    if (novaSenha && novaSenha !== confirmarSenha) {
      alert("As senhas novas não coincidem!");
      return;
    }
    alert("Informações atualizadas com sucesso!");
  };

  const excluirConta = () => {
    if (confirm("Tem certeza que deseja excluir sua conta?")) {
      alert("Conta excluída. (Simulação)");
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-4 sm:p-8 flex justify-center">
      <div className="bg-white w-full max-w-xl rounded-lg shadow-md p-6 space-y-6">
        <h1 className="text-2xl font-bold text-center">Configurações da Conta</h1>

        <form onSubmit={handleSalvar} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Nome</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full mt-1 p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Senha atual</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full mt-1 p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Nova senha</label>
            <input
              type="password"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              className="w-full mt-1 p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Confirmar nova senha</label>
            <input
              type="password"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              className="w-full mt-1 p-2 border rounded"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
          >
            Salvar alterações
          </button>
        </form>

        <hr className="my-4" />

        <div className="text-center">
          <button
            onClick={excluirConta}
            className="text-red-600 hover:underline text-sm"
          >
            Excluir minha conta
          </button>
        </div>
      </div>
    </main>
  );
}
