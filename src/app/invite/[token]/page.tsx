"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Button from "@/components/ui/Button";
import Toast from "@/components/ui/Toast";
import { acceptGroupInvite } from "@/lib/api";
import { GroupJoinResponse } from "@/types/invite";
import { validateInviteToken } from "@/utils/invite";

export default function AcceptInvitePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const toast = useToast();
  
  const [loading, setLoading] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteData, setInviteData] = useState<GroupJoinResponse | null>(null);

  const token = params?.token as string;

  useEffect(() => {
    // Se não está logado, redirecionar para login com redirect
    if (!user) {
      const currentPath = `/invite/${token}`;
      router.push(`/auth/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }

    // Se chegou aqui, o usuário está logado e pode aceitar o convite
    setLoading(false);
  }, [user, router, token]);

  const handleAcceptInvite = async () => {
    if (!token) {
      toast.error('Token de convite inválido');
      return;
    }

    try {
      setAccepting(true);
      setError(null);
      
      console.log('🤝 Aceitando convite com token:', token);
      
      const response = await acceptGroupInvite(token);
      setInviteData(response);
      
      if (response.message && response.group) {
        toast.success(response.message || 'Convite aceito com sucesso!');
        
        // Redirecionar para o grupo após 2 segundos
        setTimeout(() => {
          if (response.group.id) {
            router.push(`/groups/${response.group.id}`);
          } else {
            router.push('/groups');
          }
        }, 2000);
      } else {
        toast.error(response.message || 'Falha ao aceitar convite');
      }
      
    } catch (error: any) {
      console.error('❌ Erro ao aceitar convite:', error);
      setError(error.message || 'Erro ao aceitar convite');
      toast.error(error.message || 'Erro ao aceitar convite');
    } finally {
      setAccepting(false);
    }
  };

  const handleDeclineInvite = () => {
    toast.info('Convite recusado');
    router.push('/groups');
  };

  // Se não há token ou token inválido, mostrar erro
  if (!token || !validateInviteToken(token)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Link de Convite Inválido
          </h2>
          <p className="text-gray-600 mb-6">
            O link de convite que você acessou não é válido ou está corrompido.
          </p>
          <Button onClick={() => router.push('/groups')} className="w-full">
            Ir para Meus Grupos
          </Button>
        </div>
      </div>
    );
  }

  // Se está carregando (verificando autenticação)
  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Se convite foi aceito com sucesso
  if (inviteData?.success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Convite Aceito!
          </h2>
          <p className="text-gray-600 mb-6">
            Você foi adicionado ao grupo <strong>{inviteData.groupName}</strong> com sucesso!
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Redirecionando para o grupo...
          </p>
          <Button 
            onClick={() => router.push(inviteData.groupId ? `/groups/${inviteData.groupId}` : '/groups')} 
            className="w-full"
          >
            Ir para o Grupo
          </Button>
        </div>
      </div>
    );
  }

  // Tela principal de aceitar convite
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Convite para Grupo
            </h1>
            <p className="text-gray-600">
              Você foi convidado para participar de um grupo no FairPay!
            </p>
          </div>

          {/* Informações do usuário */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <p className="text-sm text-gray-600 mb-2">Logado como:</p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Erro se houver */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-800 font-medium">Erro</p>
              </div>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          )}

          {/* Botões de ação */}
          <div className="space-y-3">
            <Button
              onClick={handleAcceptInvite}
              disabled={accepting}
              className="w-full"
            >
              {accepting ? 'Aceitando convite...' : 'Aceitar Convite'}
            </Button>
            
            <Button
              onClick={handleDeclineInvite}
              variant="outline"
              className="w-full"
              disabled={accepting}
            >
              Recusar Convite
            </Button>
          </div>

          {/* Link para grupos */}
          <div className="mt-6 pt-6 border-t text-center">
            <button
              onClick={() => router.push('/groups')}
              className="text-blue-600 hover:text-blue-800 text-sm transition-colors"
              disabled={accepting}
            >
              Ir para Meus Grupos
            </button>
          </div>
        </div>

        {/* Container de Toasts */}
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {toast.toasts.map(toastItem => (
            <Toast
              key={toastItem.id}
              message={toastItem.message}
              type={toastItem.type}
              duration={toastItem.duration}
              onClose={() => toast.removeToast(toastItem.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
