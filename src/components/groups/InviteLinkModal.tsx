"use client";

import { useState } from 'react';
import Button from '@/components/ui/Button';
import { convertToFrontendInviteUrl, extractInviteTokenFromUrl } from '@/utils/invite';

interface InviteLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerateLink: (expiresInDays: number) => Promise<void>;
  inviteLink?: string;
  expiresAt?: string;
  loading: boolean;
  onCopySuccess?: () => void;
}

export default function InviteLinkModal({
  isOpen,
  onClose,
  onGenerateLink,
  inviteLink,
  expiresAt,
  loading,
  onCopySuccess
}: InviteLinkModalProps) {
  const [expiresInDays, setExpiresInDays] = useState(7);
  const [copySuccess, setCopySuccess] = useState(false);

  if (!isOpen) return null;

  const handleGenerateLink = async () => {
    await onGenerateLink(expiresInDays);
  };

  const handleCopyLink = async () => {
    if (!inviteLink) return;
    
    // Converter URL do backend para URL do frontend
    const frontendUrl = convertToFrontendInviteUrl(inviteLink);
    const urlToCopy = frontendUrl || inviteLink;
    
    try {
      await navigator.clipboard.writeText(urlToCopy);
      setCopySuccess(true);
      onCopySuccess?.(); // Chamar callback opcional
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Erro ao copiar link:', error);
      // Fallback para navegadores mais antigos
      const textArea = document.createElement('textarea');
      textArea.value = urlToCopy;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopySuccess(true);
      onCopySuccess?.(); // Chamar callback opcional
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleShareWhatsApp = () => {
    if (!inviteLink) return;
    const frontendUrl = convertToFrontendInviteUrl(inviteLink);
    const urlToShare = frontendUrl || inviteLink;
    const message = `Você foi convidado para participar de um grupo no FairPay! Acesse: ${urlToShare}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleShareEmail = () => {
    if (!inviteLink) return;
    const frontendUrl = convertToFrontendInviteUrl(inviteLink);
    const urlToShare = frontendUrl || inviteLink;
    const subject = 'Convite para grupo no FairPay';
    const body = `Você foi convidado para participar de um grupo no FairPay!\n\nClique no link abaixo para aceitar o convite:\n${urlToShare}\n\nO convite expira em ${formatExpiryDate(expiresAt)}.`;
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl);
  };

  const formatExpiryDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Convite para o Grupo</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Fechar modal"
              title="Fechar modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {!inviteLink ? (
            /* Configuração do convite */
            <div className="space-y-4">
              <div>
                <label htmlFor="expiresInDays" className="block text-sm font-medium text-gray-700 mb-2">
                  Validade do convite
                </label>
                <select
                  id="expiresInDays"
                  value={expiresInDays}
                  onChange={(e) => setExpiresInDays(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                >
                  <option value={1}>1 dia</option>
                  <option value={3}>3 dias</option>
                  <option value={7}>7 dias</option>
                  <option value={15}>15 dias</option>
                  <option value={30}>30 dias</option>
                </select>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  O link será válido por {expiresInDays} dia(s) e permitirá que qualquer pessoa 
                  com o link entre no grupo automaticamente.
                </p>
              </div>

              <Button
                onClick={handleGenerateLink}
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Gerando link...' : 'Gerar Link de Convite'}
              </Button>
            </div>
          ) : (
            /* Link gerado */
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link de Convite
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={convertToFrontendInviteUrl(inviteLink) || inviteLink}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
                    aria-label="Link de convite gerado"
                    title="Link de convite"
                  />
                  <Button
                    onClick={handleCopyLink}
                    variant="outline"
                    size="sm"
                    className={copySuccess ? 'bg-green-50 border-green-300' : ''}
                  >
                    {copySuccess ? '✓ Copiado' : 'Copiar'}
                  </Button>
                </div>
              </div>

              {expiresAt && (
                <p className="text-sm text-gray-600">
                  Expira em: {formatExpiryDate(expiresAt)}
                </p>
              )}

              {/* Opções de compartilhamento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Compartilhar via:
                </label>
                <div className="flex gap-2">
                  <Button
                    onClick={handleShareWhatsApp}
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-green-50 border-green-300 text-green-700 hover:bg-green-100"
                  >
                    📱 WhatsApp
                  </Button>
                  <Button
                    onClick={handleShareEmail}
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100"
                  >
                    ✉️ Email
                  </Button>
                </div>
              </div>

              {/* Botão para gerar novo link */}
              <div className="pt-4 border-t">
                <Button
                  onClick={() => {
                    setExpiresInDays(7);
                    // Limpar o link atual para mostrar o formulário novamente
                    onClose();
                  }}
                  variant="secondary"
                  size="sm"
                  className="w-full"
                >
                  Gerar Novo Link
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
