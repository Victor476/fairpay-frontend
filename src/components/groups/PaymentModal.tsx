"use client";

import { useState } from 'react';
import Button from '@/components/ui/Button';
import { registerPayment } from '@/lib/api';
import { PaymentFormData } from '@/types/payment';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  members: Array<{
    id: number;
    name: string;
    email: string;
  }>;
  onSuccess?: (payment: any) => void;
  onError?: (error: string) => void;
}

export default function PaymentModal({
  isOpen,
  onClose,
  groupId,
  members,
  onSuccess,
  onError
}: PaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<PaymentFormData>({
    fromUserId: '',
    toUserId: '',
    amount: '',
    date: new Date().toISOString().split('T')[0], // Data atual
    description: ''
  });

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = (): string | null => {
    if (!formData.fromUserId) {
      return 'Selecione quem pagou';
    }
    
    if (!formData.toUserId) {
      return 'Selecione quem recebeu';
    }
    
    if (formData.fromUserId === formData.toUserId) {
      return 'O pagador e o recebedor devem ser pessoas diferentes';
    }
    
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      return 'Valor deve ser um número positivo';
    }
    
    return null;
  };

  const isFormValid = () => {
    return validateForm() === null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      onError?.(validationError);
      return;
    }
    
    try {
      setLoading(true);
      
      const paymentData = {
        fromUserId: parseInt(formData.fromUserId),
        toUserId: parseInt(formData.toUserId),
        amount: parseFloat(formData.amount),
        date: formData.date || undefined,
        description: formData.description.trim() || undefined
      };
      
      console.log('💳 Registrando pagamento:', paymentData);
      
      const response = await registerPayment(groupId, paymentData);
      
      // Limpar formulário
      setFormData({
        fromUserId: '',
        toUserId: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: ''
      });
      
      onSuccess?.(response);
      onClose();
      
    } catch (error: any) {
      console.error('❌ Erro ao registrar pagamento:', error);
      onError?.(error.message || 'Erro ao registrar pagamento');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      // Limpar formulário ao fechar
      setFormData({
        fromUserId: '',
        toUserId: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: ''
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Registrar Pagamento
            </h2>
            <button
              onClick={handleClose}
              disabled={loading}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Fechar modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Quem pagou */}
            <div>
              <label htmlFor="fromUserId" className="block text-sm font-medium text-gray-700 mb-1">
                Quem pagou *
              </label>
              <select
                id="fromUserId"
                name="fromUserId"
                value={formData.fromUserId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
                required
              >
                <option value="">Selecione quem pagou</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Quem recebeu */}
            <div>
              <label htmlFor="toUserId" className="block text-sm font-medium text-gray-700 mb-1">
                Quem recebeu *
              </label>
              <select
                id="toUserId"
                name="toUserId"
                value={formData.toUserId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
                required
              >
                <option value="">Selecione quem recebeu</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Valor */}
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                Valor *
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
                required
              />
            </div>

            {/* Data */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Data do pagamento
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            </div>

            {/* Descrição */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Descrição (opcional)
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Ex: Pagamento pelo jantar de sexta"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                disabled={loading}
              />
            </div>

            {/* Botões */}
            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={handleClose}
                disabled={loading}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={loading || !isFormValid()}
                className="flex-1"
              >
                {loading ? 'Registrando...' : 'Registrar Pagamento'}
              </Button>
            </div>
          </form>

          {/* Informação adicional */}
          <div className="mt-4 p-3 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-700">
              💡 Este pagamento será registrado no histórico do grupo e atualizará os saldos automaticamente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
