"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { acceptGroupInvite } from '@/lib/api';
import { extractInviteTokenFromUrl } from '@/utils/invite';

interface AcceptInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (groupId?: number, groupName?: string) => void;
}

export default function AcceptInviteModal({
  isOpen,
  onClose,
  onSuccess
}: AcceptInviteModalProps) {
  const [inviteUrl, setInviteUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inviteUrl.trim()) {
      setError('Por favor, cole o link de convite');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Extrair token da URL
      const token = extractInviteTokenFromUrl(inviteUrl.trim());
      
      if (!token) {
        throw new Error('Link de convite inválido. Verifique se copiou o link completo.');
      }

      console.log('🤝 Aceitando convite com token:', token);
      
      const response = await acceptGroupInvite(token);
      
      // O endpoint /groups/join/[token] retorna { message, group: { id, name, ... } }
      if (response.message && response.group) {
        // Sucesso
        console.log('✅ Convite aceito:', response);
        
        // Chamar callback de sucesso
        onSuccess?.(response.group.id, response.group.name);
        
        // Fechar modal
        onClose();
        
        // Limpar campos
        setInviteUrl('');
        setError(null);
        
        // Redirecionar para o grupo
        if (response.group.id) {
          setTimeout(() => {
            router.push(`/groups/${response.group.id}`);
          }, 1000);
        } else {
          // Recarregar página de grupos para mostrar novo grupo
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      } else {
        setError(response.message || 'Erro ao aceitar convite');
      }
      
    } catch (error: any) {
      console.error('❌ Erro ao aceitar convite:', error);
      setError(error.message || 'Erro ao aceitar convite. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setInviteUrl('');
      setError(null);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Aceitar Convite</h2>
            <button
              onClick={handleClose}
              disabled={loading}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              aria-label="Fechar modal"
              title="Fechar modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="inviteUrl" className="block text-sm font-medium text-gray-700 mb-2">
                Link de Convite
              </label>
              <textarea
                id="inviteUrl"
                value={inviteUrl}
                onChange={(e) => setInviteUrl(e.target.value)}
                placeholder="Cole aqui o link de convite que você recebeu..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                disabled={loading}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Exemplo: http://localhost:3000/invite/abc123def456
              </p>
            </div>

            {/* Erro */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Botões */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading || !inviteUrl.trim()}
                className="flex-1"
              >
                {loading ? 'Aceitando...' : 'Aceitar Convite'}
              </Button>
            </div>
          </form>

          {/* Informações adicionais */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Como funciona?</h3>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Cole o link de convite que você recebeu</li>
              <li>• Clique em "Aceitar Convite"</li>
              <li>• Você será adicionado ao grupo automaticamente</li>
              <li>• Será redirecionado para o novo grupo</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
