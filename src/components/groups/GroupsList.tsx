"use client";

import { useState } from "react";
import Link from "next/link";
import { Group } from "@/types/group";
import GroupCard from "./GroupCard";
import Button from "@/components/ui/Button";
// Substituindo por símbolos simples até instalar Heroicons
const PlusIcon = ({ className }: { className?: string }) => (
  <span className={`inline-block ${className}`}>+</span>
);

interface GroupsListProps {
  groups: Group[];
}

export default function GroupsList({ groups }: GroupsListProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  if (groups.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="max-w-md mx-auto">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-blue-100 mb-6">
            <svg
              className="h-10 w-10 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-3">
            Nenhum grupo encontrado
          </h3>
          <p className="text-gray-500 mb-8 text-lg">
            Comece criando seu primeiro grupo para gerenciar despesas compartilhadas
            com seus amigos.
          </p>
          <Link href="/groups/new">
            <button className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <PlusIcon className="h-5 w-5 mr-2" />
              Criar primeiro grupo
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header com controles */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            {groups.length} {groups.length === 1 ? "grupo" : "grupos"}
          </div>
          
          {/* Toggle de visualização */}
          <div className="flex rounded-lg shadow-sm border border-gray-300">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                viewMode === "grid"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <svg className="h-4 w-4 mr-2 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Grade
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                viewMode === "list"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <svg className="h-4 w-4 mr-2 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              Lista
            </button>
          </div>
        </div>

        <Link href="/groups/new">
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <PlusIcon className="h-4 w-4 mr-2" />
            Novo grupo
          </button>
        </Link>
      </div>

      {/* Lista/Grade de grupos */}
      <div className={
        viewMode === "grid" 
          ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3" 
          : "space-y-4"
      }>
        {groups.map((group) => (
          <GroupCard
            key={group.id}
            group={group}
            viewMode={viewMode}
          />
        ))}
      </div>
    </div>
  );
}
