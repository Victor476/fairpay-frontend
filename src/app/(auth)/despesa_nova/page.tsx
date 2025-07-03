"use client";
import { useState } from "react";

export default function NovaDespesaPage() {
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [categoria, setCategoria] = useState("Alimentação");
  const [data, setData] = useState("");
  const [pagador, setPagador] = useState("");
  const [participantes, setParticipantes] = useState<string[]>([]);

  const usuariosDisponiveis = ["Guilherme", "Victor", "Amanda", "Julia"];
  const categorias = ["Alimentação", "Transporte", "Moradia", "Lazer", "Outros"];

  const handleCheckbox = (nome: string) => {
    setParticipantes((prev) =>
      prev.includes(nome) ? prev.filter((n) => n !== nome) : [...prev, nome]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const despesa = {
      descricao,
      valor: parseFloat(valor),
      categoria,
      data,
      pagador,
      participantes,
    };
    alert("Despesa registrada com sucesso!\n" + JSON.stringify(despesa, null, 2));
  };

  return (
    <main className="min-h-screen bg-gray-50 p-4 sm:p-8 flex justify-center items-start">
      <div className="bg-white w-full max-w-2xl rounded-lg shadow-md p-6 space-y-6">
        <h1 className="text-2xl font-bold text-center">Adicionar Nova Despesa</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium text-sm">Descrição</label>
            <input
              type="text"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="w-full mt-1 p-2 border rounded"
              placeholder="Ex: Jantar, aluguel..."
              required
            />
          </div>

          <div>
            <label className="block font-medium text-sm">Valor (R$)</label>
            <input
              type="number"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              className="w-full mt-1 p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block font-medium text-sm">Categoria</label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full mt-1 p-2 border rounded"
            >
              {categorias.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium text-sm">Data</label>
            <input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="w-full mt-1 p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block font-medium text-sm">Quem pagou?</label>
            <select
              value={pagador}
              onChange={(e) => setPagador(e.target.value)}
              className="w-full mt-1 p-2 border rounded"
              required
            >
              <option value="">Selecione</option>
              {usuariosDisponiveis.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium text-sm">Participantes</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {usuariosDisponiveis.map((u) => (
                <label key={u} className="flex items-center gap-1 text-sm">
                  <input
                    type="checkbox"
                    checked={participantes.includes(u)}
                    onChange={() => handleCheckbox(u)}
                  />
                  {u}
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
          >
            Registrar Despesa
          </button>
        </form>
      </div>
    </main>
  );
}
