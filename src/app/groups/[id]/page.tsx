"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Button from "@/components/ui/Button";
import Toast from "@/components/ui/Toast";
import InviteLinkModal from "@/components/groups/InviteLinkModal";
import PaymentModal from "@/components/groups/PaymentModal";
import { fetchGroupById, fetchGroupExpenses, fetchGroupMembers, generateInviteLink, registerPayment } from "@/lib/api";
import { GroupDetails } from "@/types/group";
import { Expense } from "@/types/expense";
import { GroupInviteLinkResponse } from "@/types/invite";

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const toast = useToast();
  const [group, setGroup] = useState<GroupDetails | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para o modal de convite
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteLinkData, setInviteLinkData] = useState<GroupInviteLinkResponse | null>(null);
  
  // Estados para o modal de pagamento
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const groupId = params?.id as string;

  useEffect(() => {
    if (groupId) {
      // Aguardar um pouco para garantir que o AuthContext foi inicializado
      const timer = setTimeout(() => {
        fetchGroupDetails();
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [groupId]);

  const fetchGroupDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Buscando detalhes do grupo:', groupId);
      
      // Tentar buscar o grupo real do backend
      try {
        const [groupData, expensesData] = await Promise.all([
          fetchGroupById(groupId),
          fetchGroupExpenses(groupId)
        ]);
        
        setGroup(groupData);
        setExpenses(expensesData);
        console.log('✅ Grupo encontrado:', groupData);
        console.log('✅ Despesas encontradas:', expensesData);
      } catch (apiError: any) {
        console.log('⚠️ API de detalhes do grupo falhou, tentando buscar membros separadamente:', apiError.message);
        
        // Tentar buscar membros separadamente
        let members = [];
        try {
          members = await fetchGroupMembers(groupId);
          console.log('✅ Membros encontrados via endpoint separado:', members);
          
          // Definir o usuário atual como admin se for o primeiro membro
          if (members.length > 0 && user) {
            const currentUserMember = members.find(m => m.email === user.email || m.id === user.id);
            if (currentUserMember) {
              currentUserMember.role = 'admin'; // Usuário atual sempre admin
            }
          }
        } catch (membersError: any) {
          console.log('⚠️ Endpoint de membros também falhou:', membersError.message);
        }
        
        // Se conseguiu buscar despesas, usar dados reais + mock para o grupo
        let expenses: Expense[] = [];
        try {
          expenses = await fetchGroupExpenses(groupId);
          console.log('✅ Despesas encontradas:', expenses);
        } catch (expensesError: any) {
          console.log('⚠️ Endpoint de despesas falhou:', expensesError.message);
        }
        
        // Usar dados mock melhorados para demonstração
        const mockMembers = members.length > 0 ? members : [
          {
            id: parseInt(user?.id?.toString() || "1"),
            name: user?.name || "Você",
            email: user?.email || "usuario@exemplo.com",
            role: "admin",
            joinedAt: new Date().toISOString(),
            isActive: true
          },
          {
            id: 2,
            name: "Maria Silva",
            email: "maria@exemplo.com",
            role: "member",
            joinedAt: new Date(Date.now() - 86400000).toISOString(), // 1 dia atrás
            isActive: true
          },
          {
            id: 3,
            name: "João Santos",
            email: "joao@exemplo.com",
            role: "member",
            joinedAt: new Date(Date.now() - 172800000).toISOString(), // 2 dias atrás
            isActive: true
          }
        ];
        
        const mockGroup: GroupDetails = {
          id: parseInt(groupId),
          name: members.length > 0 ? "Grupo Real (Membros do Backend)" : "Grupo de Demonstração",
          description: members.length > 0 
            ? "Os membros deste grupo foram recuperados do backend. Alguns detalhes podem estar em modo demonstração devido a problemas no servidor."
            : "Este grupo está sendo exibido com dados de demonstração devido a problemas no backend.",
          imageUrl: undefined,
          createdAt: new Date().toISOString(),
          createdBy: {
            id: parseInt(user?.id?.toString() || "1"),
            name: user?.name || "Você"
          },
          totalExpenses: expenses.reduce((total, expense) => total + expense.totalAmount, 0),
          membersCount: mockMembers.length,
          members: mockMembers
        };
        
        setGroup(mockGroup);
        setExpenses(expenses);
        console.log('ℹ️ Exibindo dados de demonstração com múltiplos membros. Problema no backend detectado.');
      }
      
    } catch (err: any) {
      console.error("❌ Erro ao buscar detalhes do grupo:", err);
      setError(err.message || "Erro ao carregar detalhes do grupo");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToGroups = () => {
    router.push("/groups");
  };

  const handleOpenInviteModal = () => {
    setIsInviteModalOpen(true);
    setInviteLinkData(null); // Limpar dados anteriores
  };

  const handleCloseInviteModal = () => {
    setIsInviteModalOpen(false);
    setInviteLinkData(null);
  };

  const handleOpenPaymentModal = () => {
    setIsPaymentModalOpen(true);
  };

  const handleClosePaymentModal = () => {
    setIsPaymentModalOpen(false);
  };

  const handleGenerateInviteLink = async (expiresInDays: number) => {
    try {
      setInviteLoading(true);
      console.log('🔗 Gerando link de convite para grupo:', groupId, 'válido por', expiresInDays, 'dias');
      
      const response = await generateInviteLink(groupId, { expiresInDays });
      setInviteLinkData(response);
      console.log('✅ Link de convite gerado:', response);
      
      toast.success('Link de convite gerado com sucesso!', 3000);
    } catch (error: any) {
      console.error('❌ Erro ao gerar link de convite:', error);
      toast.error('Erro ao gerar link de convite: ' + (error.message || 'Erro desconhecido'));
    } finally {
      setInviteLoading(false);
    }
  };

  const handlePaymentSuccess = (payment: any) => {
    console.log('✅ Pagamento registrado com sucesso:', payment);
    toast.success('Pagamento registrado com sucesso!', 3000);
    
    // Recarregar dados do grupo para atualizar saldos
    fetchGroupDetails();
  };

  const handlePaymentError = (error: string) => {
    console.error('❌ Erro no pagamento:', error);
    toast.error(error);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !group) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Grupo não encontrado
            </h2>
            <p className="text-gray-600 mb-6">
              {error || "O grupo que você está procurando não existe ou você não tem permissão para acessá-lo."}
            </p>
            <Button onClick={handleBackToGroups} className="w-full">
              Voltar para Meus Grupos
            </Button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            {/* Header com botão voltar */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={handleBackToGroups}
                className="text-blue-600 hover:text-blue-800 flex items-center gap-2 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Voltar para Meus Grupos
              </button>
            </div>

            {/* Informações do grupo */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                {group.imageUrl ? (
                  <img
                    src={group.imageUrl}
                    alt={group.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-blue-600">
                      {getInitials(group.name)}
                    </span>
                  </div>
                )}
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{group.name}</h1>
                  <p className="text-gray-600 mt-1">
                    Criado por {group.createdBy?.name} em {formatDate(group.createdAt)}
                  </p>
                </div>
              </div>

              {group.description && (
                <p className="text-gray-700 mb-4 bg-gray-50 p-4 rounded-lg">{group.description}</p>
              )}

              {/* Estatísticas do grupo */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">Total de Despesas</h3>
                  <p className="text-2xl font-bold text-blue-600">
                    R$ {group.totalExpenses.toFixed(2)}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-2">Membros</h3>
                  <p className="text-2xl font-bold text-green-600">
                    {group.membersCount}
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-900 mb-2">Status</h3>
                  <p className="text-2xl font-bold text-purple-600">
                    Ativo
                  </p>
                </div>
              </div>
            </div>

            {/* Membros do grupo */}
            {group.members && group.members.length > 0 && (
              <div className="border-t pt-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Membros do Grupo
                  </h2>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleOpenInviteModal}
                  >
                    + Convidar
                  </Button>
                </div>
                <div className="space-y-3">
                  {group.members.map((member) => (
                    <div key={member.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {getInitials(member.name)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{member.name}</p>
                        <p className="text-sm text-gray-500">{member.email}</p>
                      </div>
                      {member.role && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          member.role === 'admin' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {member.role === 'admin' ? 'Administrador' : 'Membro'}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Despesas do grupo */}
            <div className="border-t pt-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Despesas do Grupo
                </h2>
                <Button 
                  onClick={() => router.push(`/groups/${groupId}/expenses/new`)}
                  size="sm"
                >
                  + Nova Despesa
                </Button>
              </div>
              
              {expenses.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <div className="text-gray-400 mb-2">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-600 mb-4">Nenhuma despesa registrada ainda</p>
                  <Button 
                    onClick={() => router.push(`/groups/${groupId}/expenses/new`)}
                    variant="outline"
                  >
                    Criar primeira despesa
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {expenses.map((expense) => (
                    <div key={expense.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-gray-900">{expense.description}</h3>
                        <span className="text-lg font-semibold text-green-600">
                          R$ {expense.totalAmount.toFixed(2)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>Pago por: <span className="font-medium">{expense.paidBy.name}</span></p>
                        <p>Data: {new Date(expense.expenseDate).toLocaleDateString('pt-BR')}</p>
                        <p>Participantes: {expense.participants.length} pessoa(s)</p>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1">
                        {expense.participants.map((participant) => (
                          <span 
                            key={participant.id} 
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                          >
                            {participant.name} (R$ {participant.share.toFixed(2)})
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Próximos passos */}
            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Próximos Passos
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Convidar Membros
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Convide outras pessoas para participar do grupo e compartilhar despesas
                  </p>
                  <Button 
                    variant="secondary" 
                    className="w-full"
                    onClick={handleOpenInviteModal}
                  >
                    Gerar Link de Convite
                  </Button>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Adicionar Despesa
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Registre uma nova despesa do grupo para dividir os custos
                  </p>
                  <Button 
                    className="w-full"
                    onClick={() => router.push(`/groups/${groupId}/expenses/new`)}
                  >
                    Nova Despesa
                  </Button>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Registrar Pagamento
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Registre um pagamento manual entre membros do grupo
                  </p>
                  <Button 
                    variant="outline"
                    className="w-full"
                    onClick={handleOpenPaymentModal}
                    disabled={!group?.members || group.members.length < 2}
                  >
                    💳 Registrar Pagamento
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal de Convite */}
        <InviteLinkModal
          isOpen={isInviteModalOpen}
          onClose={handleCloseInviteModal}
          onGenerateLink={handleGenerateInviteLink}
          inviteLink={inviteLinkData?.inviteLink}
          expiresAt={inviteLinkData?.expiresAt}
          loading={inviteLoading}
          onCopySuccess={() => toast.success('Link copiado para a área de transferência!', 2000)}
        />

        {/* Modal de Pagamento */}
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={handleClosePaymentModal}
          groupId={groupId}
          members={group?.members || []}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
        />

        {/* Modal de Pagamento */}
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={handleClosePaymentModal}
          groupId={groupId}
          members={group?.members || []}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
        />

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
    </ProtectedRoute>
  );
}
