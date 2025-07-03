"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchUserGroups } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import GroupsList from "@/components/groups/GroupsList";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Group } from "@/types/group";

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Usar a nova função que tem fallback para dados mock
      const data = await fetchUserGroups();
      setGroups(data);
    } catch (err) {
      console.error("Erro ao carregar grupos:", err);
      setError("Erro ao carregar grupos. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
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
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header com título, informações do usuário e botão de criar grupo */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-4 sm:mb-0">
              <h1 className="text-3xl font-bold text-gray-900">Meus Grupos</h1>
              <p className="text-gray-600 mt-2">
                Gerencie suas despesas compartilhadas com facilidade
              </p>
              {user && (
                <p className="text-sm text-gray-500 mt-1">
                  Bem-vindo, {user.name}
                </p>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Sair
              </button>
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
    </ProtectedRoute>
  );
}
