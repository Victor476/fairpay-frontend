"use client";
import { useState } from "react";

type Despesa = {
  id: number;
  descricao: string;
  valor: number;
  categoria: string;
  data: string;
  pagador: string;
};

export default function DashboardPage() {
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroData, setFiltroData] = useState("");

  const despesas: Despesa[] = [
    { id: 1, descricao: "Almoço", valor: 50, categoria: "Alimentação", data: "2025-07-01", pagador: "Guilherme" },
    { id: 2, descricao: "Uber", valor: 30, categoria: "Transporte", data: "2025-07-01", pagador: "Victor" },
    { id: 3, descricao: "Pizza", valor: 80, categoria: "Alimentação", data: "2025-07-02", pagador: "Guilherme" },
    { id: 4, descricao: "Internet", valor: 120, categoria: "Moradia", data: "2025-07-01", pagador: "Victor" },
  ];

  const categorias = ["Todas", "Alimentação", "Transporte", "Moradia"];

  const despesasFiltradas = despesas.filter((d) => {
    return (
      (filtroCategoria === "" || filtroCategoria === "Todas" || d.categoria === filtroCategoria) &&
      (filtroData === "" || d.data === filtroData)
    );
  });

  const saldoPorPessoa = despesas.reduce((acc, d) => {
    acc[d.pagador] = (acc[d.pagador] || 0) + d.valor;
    return acc;
  }, {} as Record<string, number>);

  return (
    <main className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <h1 className="text-2xl font-bold mb-6 text-center">Painel de Despesas</h1>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Saldo Individual</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(saldoPorPessoa).map(([pessoa, total]) => (
            <div key={pessoa} className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-gray-600">Pessoa</p>
              <p className="font-bold">{pessoa}</p>
              <p className="text-sm mt-1 text-gray-600">Total Pago</p>
              <p className="text-green-600 font-semibold">R$ {total.toFixed(2)}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Despesas do Grupo</h2>

        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            className="border p-2 rounded-lg"
          >
            {categorias.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <input
            type="date"
            value={filtroData}
            onChange={(e) => setFiltroData(e.target.value)}
            className="border p-2 rounded-lg"
          />
        </div>

        <table className="w-full text-left bg-white rounded-lg shadow overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Descrição</th>
              <th className="p-3">Valor</th>
              <th className="p-3">Categoria</th>
              <th className="p-3">Data</th>
              <th className="p-3">Pagador</th>
            </tr>
          </thead>
          <tbody>
            {despesasFiltradas.map((d) => (
              <tr key={d.id} className="border-t">
                <td className="p-3">{d.descricao}</td>
                <td className="p-3">R$ {d.valor.toFixed(2)}</td>
                <td className="p-3">{d.categoria}</td>
                <td className="p-3">{d.data}</td>
                <td className="p-3">{d.pagador}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
