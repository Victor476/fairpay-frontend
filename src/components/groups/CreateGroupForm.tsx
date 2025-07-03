'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import FormError from '@/components/ui/FormError';
import { createGroup } from '@/lib/api';

interface CreateGroupFormData {
  name: string;
  description: string;
  imageUrl: string;
}

interface FormErrors {
  name?: string;
  description?: string;
  imageUrl?: string;
  general?: string;
}

function CreateGroupForm() {
  const [formData, setFormData] = useState<CreateGroupFormData>({
    name: '',
    description: '',
    imageUrl: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Validação do formulário
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validar nome (obrigatório)
    if (!formData.name.trim()) {
      newErrors.name = 'Nome do grupo é obrigatório';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Nome do grupo deve ter pelo menos 2 caracteres';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Nome do grupo deve ter no máximo 100 caracteres';
    }

    // Validar descrição (opcional, mas se preenchida deve estar dentro dos limites)
    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Descrição deve ter no máximo 500 caracteres';
    }

    // Validar URL da imagem (opcional, mas se preenchida deve ser válida)
    if (formData.imageUrl && !isValidUrl(formData.imageUrl)) {
      newErrors.imageUrl = 'URL da imagem deve ser válida (ex: https://exemplo.com/imagem.png)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Verificar se URL é válida
  const isValidUrl = (string: string): boolean => {
    try {
      const url = new URL(string);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
      return false;
    }
  };

  // Limpar erro quando usuário começar a digitar
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpar erro do campo específico
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  // Enviar formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar antes de enviar
    if (!validateForm()) {
      console.log('❌ Erros no formulário:', errors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      console.log('🚀 Criando grupo com dados:', formData);
      
      // Preparar dados para envio (remover campos vazios)
      const groupData = {
        name: formData.name.trim(),
        ...(formData.description.trim() && { description: formData.description.trim() }),
        ...(formData.imageUrl.trim() && { imageUrl: formData.imageUrl.trim() }),
      };

      // Criar grupo
      const newGroup = await createGroup(groupData);
      
      console.log('✅ Grupo criado com sucesso:', newGroup);
      
      // Mostrar mensagem de sucesso no console
      console.log(`🎉 Grupo "${newGroup.name}" criado com sucesso!`);
      
      // Redirecionar para a página do grupo criado
      router.push(`/groups/${newGroup.id}`);
      
    } catch (error: any) {
      console.error('❌ Erro ao criar grupo:', error);
      
      // Tratar diferentes tipos de erro
      if (error.message.includes('sessão expirou') || error.message.includes('login')) {
        setErrors({ general: error.message });
        console.error('🔐 Sessão expirada. Redirecionando para login...');
        setTimeout(() => router.push('/login'), 2000);
      } else if (error.message.includes('nome')) {
        setErrors({ name: error.message });
      } else {
        setErrors({ general: error.message });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Cancelar e voltar
  const handleCancel = () => {
    router.push('/groups');
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-900">
        Criar Novo Grupo
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Erro geral */}
        {errors.general && (
          <FormError message={errors.general} />
        )}
        
        {/* Nome do grupo */}
        <div>
          <Input
            id="name"
            name="name"
            type="text"
            label="Nome do grupo"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            disabled={isLoading}
            placeholder="Ex: Viagem para o Rio"
            required
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
            rows={3}
            value={formData.description}
            onChange={handleChange}
            disabled={isLoading}
            placeholder="Descreva o propósito do grupo (ex: dividir despesas da viagem de final de semana)"
            maxLength={500}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none ${
              errors.description 
                ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300'
            } ${isLoading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            {formData.description.length}/500 caracteres
          </p>
        </div>
        
        {/* URL da imagem */}
        <div>
          <Input
            id="imageUrl"
            name="imageUrl"
            type="url"
            label="URL da imagem/avatar do grupo (opcional)"
            value={formData.imageUrl}
            onChange={handleChange}
            error={errors.imageUrl}
            disabled={isLoading}
            placeholder="https://exemplo.com/imagem.png"
          />
        </div>
        
        {/* Botões */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            disabled={isLoading}
            onClick={handleCancel}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="flex-1"
            disabled={isLoading}
          >
            {isLoading ? 'Criando...' : 'Criar Grupo'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default CreateGroupForm;
