"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import FormError from '@/components/ui/FormError';

export default function LoginForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'E-mail deve ter um formato válido';
    }

    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      await login(formData.email, formData.password);
      router.push('/groups'); // Redirecionar para a página de grupos após login
    } catch (error: any) {
      console.error('Erro no login:', error);
      
      // Tratar diferentes tipos de erro
      if (error.message.includes('401')) {
        setErrors({ general: 'Credenciais inválidas. Verifique seu e-mail e senha.' });
      } else if (error.message.includes('404')) {
        setErrors({ general: 'Conta não encontrada. Verifique seu e-mail ou cadastre-se.' });
      } else if (error.message.includes('500')) {
        setErrors({ general: 'Erro no servidor. Tente novamente mais tarde.' });
      } else {
        setErrors({ general: 'Erro ao fazer login. Tente novamente.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpar erro do campo quando começar a digitar
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">Entrar na sua conta</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.general && (
          <FormError message={errors.general} />
        )}
        
        <div>
          <Input
            id="email"
            name="email"
            type="email"
            label="E-mail"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            disabled={isLoading}
            placeholder="seu@email.com"
            required
          />
        </div>
        
        <div>
          <Input
            id="password"
            name="password"
            type="password"
            label="Senha"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            disabled={isLoading}
            placeholder="Sua senha"
            required
          />
          <div className="mt-1 text-right">
            <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
              Esqueceu sua senha?
            </Link>
          </div>
        </div>
        
        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Entrando...' : 'Entrar'}
        </Button>
      </form>
      
      <p className="mt-4 text-center text-sm">
        Não tem uma conta?{" "}
        <Link href="/register" className="text-blue-600 hover:underline">
          Cadastre-se
        </Link>
      </p>
    </div>
  );
}