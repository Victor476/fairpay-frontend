"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';
import { createExpense, fetchGroupById, fetchGroupMembers } from '@/lib/api';
import { ExpenseFormData } from '@/types/expense';

export default function NewExpensePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const groupId = params?.id as string;
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [group, setGroup] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  
  const [formData, setFormData] = useState<ExpenseFormData>({
    description: '',
    totalAmount: '',
    date: new Date().toISOString().split('T')[0], // Data atual
    payer: user?.email || '',
    participants: [user?.email || '']
  });

  useEffect(() => {
    if (groupId && user?.email) {
      loadGroupData();
      setFormData(prev => ({
        ...prev,
        payer: user.email,
        participants: [user.email]
      }));
    }
  }, [groupId, user?.email]);

  const loadGroupData = async () => {
    try {
      setLoadingData(true);
      
      // Carregar dados do grupo e membros
      const [groupData, membersData] = await Promise.all([
        fetchGroupById(groupId),
        fetchGroupMembers(groupId)
      ]);
      
      setGroup(groupData);
      setMembers(membersData);
      
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      setError(error.message || 'Erro ao carregar dados do grupo');
    } finally {
      setLoadingData(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePayerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPayer = e.target.value;
    setFormData(prev => ({
      ...prev,
      payer: newPayer,
      // Garantir que o pagador esteja sempre na lista de participantes
      participants: prev.participants.includes(newPayer) 
        ? prev.participants 
        : [...prev.participants, newPayer]
    }));
  };

  const handleParticipantToggle = (email: string) => {
    setFormData(prev => {
      const isIncluded = prev.participants.includes(email);
      const newParticipants = isIncluded
        ? prev.participants.filter(p => p !== email)
        : [...prev.participants, email];
      
      // Se removeu o pagador dos participantes, selecionar outro pagador
      let newPayer = prev.payer;
      if (!newParticipants.includes(prev.payer)) {
        newPayer = newParticipants[0] || '';
      }
      
      return {
        ...prev,
        participants: newParticipants,
        payer: newPayer
      };
    });
  };

  const validateForm = (): string | null => {
    if (!formData.description.trim()) {
      return 'Descrição é obrigatória';
    }
    
    const amount = parseFloat(formData.totalAmount);
    if (isNaN(amount) || amount <= 0) {
      return 'Valor deve ser um número positivo';
    }
    
    if (!formData.date) {
      return 'Data é obrigatória';
    }
    
    if (!formData.payer) {
      return 'Pagador é obrigatório';
    }
    
    if (formData.participants.length === 0) {
      return 'Pelo menos um participante deve ser selecionado';
    }
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const expenseData = {
        description: formData.description.trim(),
        totalAmount: parseFloat(formData.totalAmount),
        date: formData.date,
        payer: formData.payer,
        participants: formData.participants,
        groupId: parseInt(groupId)
      };
      
      console.log('📝 Criando despesa:', expenseData);
      
      await createExpense(groupId, expenseData);
      
      setSuccess(true);
      
      // Redirecionar após 2 segundos
      setTimeout(() => {
        router.push(`/groups/${groupId}`);
      }, 2000);
      
    } catch (error: any) {
      console.error('Erro ao criar despesa:', error);
      setError(error.message || 'Erro ao criar despesa');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Nova Despesa</h1>
              {group && (
                <p className="text-gray-600 mt-1">Grupo: {group.name}</p>
              )}
            </div>

            {success && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
                <p className="text-green-700">✅ Despesa criada com sucesso! Redirecionando...</p>
              </div>
            )}

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-700">❌ {error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Descrição */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição *
                </label>
                <input
                  type="text"
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Ex: Almoço de sábado"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Valor */}
              <div>
                <label htmlFor="totalAmount" className="block text-sm font-medium text-gray-700 mb-1">
                  Valor Total *
                </label>
                <input
                  type="number"
                  id="totalAmount"
                  name="totalAmount"
                  value={formData.totalAmount}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Data */}
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                  Data *
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Pagador */}
              <div>
                <label htmlFor="payer" className="block text-sm font-medium text-gray-700 mb-1">
                  Quem Pagou *
                </label>
                <select
                  id="payer"
                  value={formData.payer}
                  onChange={handlePayerChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Selecione quem pagou</option>
                  {members.map((member) => (
                    <option key={member.email} value={member.email}>
                      {member.name} ({member.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Participantes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Participantes * (quem vai dividir a despesa)
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-200 rounded-md p-2">
                  {members.map((member) => (
                    <label key={member.email} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.participants.includes(member.email)}
                        onChange={() => handleParticipantToggle(member.email)}
                        className="mr-2"
                      />
                      <span className="text-sm">
                        {member.name} ({member.email})
                      </span>
                    </label>
                  ))}
                </div>
                {formData.participants.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.participants.length} participante(s) selecionado(s)
                  </p>
                )}
              </div>

              {/* Botões */}
              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => router.push(`/groups/${groupId}`)}
                  disabled={loading}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading || success}
                  className="flex-1"
                >
                  {loading ? 'Criando...' : 'Criar Despesa'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
