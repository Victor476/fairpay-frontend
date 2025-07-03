"use client";
import { useState } from "react";

type Membro = {
  id: number;
  nome: string;
  email: string;
};

export default function MembrosPage() {
  const [membros, setMembros] = useState<Membro[]>([
    { id: 1, nome: "Guilherme", email: "gui@email.com" },
    { id: 2, nome: "Victor", email: "vic@email.com" },
  ]);

  const [emailNovo, setEmailNovo] = useState("");

  const adicionarMembro = () => {
    if (!emailNovo) return;
    const novoMembro: Membro = {
      id: membros.length + 1,
      nome: emailNovo.split("@")[0],
      email: emailNovo,
    };
    setMembros([...membros, novoMembro]);
    setEmailNovo("");
  };

  const removerMembro = (id: number) => {
    if (confirm("Deseja realmente remover este membro?")) {
      setMembros(membros.filter((m) => m.id !== id));
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-4 sm:p-8 flex justify-center">
      <div className="bg-white w-full max-w-2xl rounded-lg shadow-md p-6 space-y-6">
        <h1 className="text-2xl font-bold text-center">Membros do Grupo</h1>

        <div className="flex gap-2 flex-col sm:flex-row">
          <input
            type="email"
            value={emailNovo}
            onChange={(e) => setEmailNovo(e.target.value)}
            placeholder="E-mail do novo membro"
            className="w-full p-2 border rounded"
          />
          <button
            onClick={adicionarMembro}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
          >
            Adicionar
          </button>
        </div>

        <table className="w-full text-left bg-white rounded-lg shadow overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Nome</th>
              <th className="p-3">E-mail</th>
              <th className="p-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {membros.map((m) => (
              <tr key={m.id} className="border-t">
                <td className="p-3">{m.nome}</td>
                <td className="p-3">{m.email}</td>
                <td className="p-3">
                  <button
                    onClick={() => removerMembro(m.id)}
                    className="text-red-600 hover:underline text-sm"
                  >
                    Remover
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
