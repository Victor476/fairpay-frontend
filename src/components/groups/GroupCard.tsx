"use client";

import Link from "next/link";
import { Group } from "@/types/group";

interface GroupCardProps {
  group: Group;
  viewMode: "grid" | "list";
}

export default function GroupCard({ group, viewMode }: GroupCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-blue-100 text-blue-600",
      "bg-green-100 text-green-600",
      "bg-purple-100 text-purple-600",
      "bg-yellow-100 text-yellow-600",
      "bg-red-100 text-red-600",
      "bg-indigo-100 text-indigo-600",
    ];
    const index = name.length % colors.length;
    return colors[index];
  };

  if (viewMode === "list") {
    return (
      <Link href={`/groups/${group.id}`}>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-blue-300 transition-all duration-200 cursor-pointer">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                {group.avatarUrl ? (
                  <img
                    src={group.avatarUrl}
                    alt={group.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className={`h-12 w-12 rounded-full flex items-center justify-center font-medium ${getAvatarColor(
                      group.name
                    )}`}
                  >
                    {getInitials(group.name)}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-medium text-gray-900 truncate">
                  {group.name}
                </h3>
                {group.description && (
                  <p className="text-sm text-gray-500 truncate">
                    {group.description}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <div className="text-right">
                <p className="font-medium text-gray-900 text-lg">
                  {formatCurrency(group.totalExpenses)}
                </p>
                <p className="text-xs">Total de gastos</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900 text-lg">
                  {group.membersCount}
                </p>
                <p className="text-xs">
                  {group.membersCount === 1 ? "membro" : "membros"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/groups/${group.id}`}>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-blue-300 transition-all duration-200 cursor-pointer">
        <div className="flex items-center space-x-4 mb-6">
          {group.avatarUrl ? (
            <img
              src={group.avatarUrl}
              alt={group.name}
              className="h-14 w-14 rounded-full object-cover"
            />
          ) : (
            <div
              className={`h-14 w-14 rounded-full flex items-center justify-center font-medium text-lg ${getAvatarColor(
                group.name
              )}`}
            >
              {getInitials(group.name)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="text-xl font-semibold text-gray-900 truncate">
              {group.name}
            </h3>
            {group.description && (
              <p className="text-sm text-gray-500 truncate mt-1">
                {group.description}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-600">
              Total de gastos
            </span>
            <span className="text-xl font-bold text-green-600">
              {formatCurrency(group.totalExpenses)}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-600">Membros</span>
            <span className="text-lg font-semibold text-gray-900">
              {group.membersCount}{" "}
              {group.membersCount === 1 ? "membro" : "membros"}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
