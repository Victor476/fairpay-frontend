"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchApi } from "@/lib/api";
import GroupsList from "@/components/groups/GroupsList";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Group } from "@/types/group";

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Por enquanto, vamos usar dados mock enquanto a autenticação não está funcionando
      const mockGroups: Group[] = [
        {
          id: 1,
          name: "Casa dos Amigos",
          description: "Despesas mensais do apartamento",
          avatarUrl: "",
          totalExpenses: 540.75,
          membersCount: 4
        },
        {
          id: 2,
          name: "Viagem a Salvador",
          description: "Gastos da viagem de verão",
          avatarUrl: "",
          totalExpenses: 1250.00,
          membersCount: 3
        },
        {
          id: 3,
          name: "Churrascos",
          description: "Encontros de fim de semana",
          avatarUrl: "",
          totalExpenses: 320.50,
          membersCount: 8
        }
      ];
      
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setGroups(mockGroups);
      
      // Quando a autenticação estiver funcionando, usar:
      // const data = await fetchApi("/api/users/me/groups");
      // setGroups(data);
    } catch (err) {
      console.error("Erro ao carregar grupos:", err);
      setError("Erro ao carregar grupos. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchGroups}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header com título e botão de criar grupo */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-3xl font-bold text-gray-900">Meus Grupos</h1>
            <p className="text-gray-600 mt-2">
              Gerencie suas despesas compartilhadas com facilidade
            </p>
          </div>
          <div className="flex space-x-3">
            <Link href="/groups/new">
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <span className="mr-2">+</span>
                Criar Grupo
              </button>
            </Link>
          </div>
        </div>

        <GroupsList groups={groups} />
      </div>
    </div>
  );
}
