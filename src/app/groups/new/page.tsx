"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import CreateGroupForm from '@/components/groups/CreateGroupForm';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function NewGroupPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Será redirecionado
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Criar Novo Grupo</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Crie um grupo para organizar e compartilhar despesas com outras pessoas. 
              Perfeito para viagens, casa compartilhada, eventos ou qualquer situacao onde voces precisem dividir custos.
            </p>
          </div>
          
          <CreateGroupForm />
        </div>
      </div>
    </ProtectedRoute>
  );
}
