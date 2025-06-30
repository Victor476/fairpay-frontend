"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "../ui/Button";
import Input from "../ui/Input";
import FormError from "../ui/FormError";

interface RegisterFormProps {
  onSubmit: (data: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => Promise<{ success: boolean; message: string }>;
}

export default function RegisterForm({ onSubmit }: RegisterFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = "Nome é obrigatório";
    if (!email.trim()) newErrors.email = "E-mail é obrigatório";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) 
      newErrors.email = "Formato de e-mail inválido";
    
    if (!password) newErrors.password = "Senha é obrigatória";
    else if (password.length < 6) 
      newErrors.password = "Senha deve ter pelo menos 6 caracteres";
    
    if (password !== confirmPassword)
      newErrors.confirmPassword = "As senhas não conferem";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      const result = await onSubmit({ name, email, password, confirmPassword });
      
      if (result.success) {
        // Redirecionar para login ou dashboard
        router.push("/login");
      } else {
        setFormError(result.message || "Erro ao criar conta. Tente novamente.");
      }
    } catch (error) {
      setFormError("Erro ao processar o cadastro. Tente novamente.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">Crie sua conta</h2>
      
      {formError && (
        <FormError message={formError} className="mb-4" />
      )}
      
      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-4">
          <Input
            label="Nome completo"
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
            required
          />
        </div>
        
        <div className="mb-4">
          <Input
            label="E-mail"
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            required
          />
        </div>
        
        <div className="mb-4">
          <Input
            label="Senha"
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            required
          />
        </div>
        
        <div className="mb-6">
          <Input
            label="Confirme sua senha"
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={errors.confirmPassword}
            required
          />
        </div>
        
        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Cadastrando..." : "Criar conta"}
        </Button>
      </form>
      
      <p className="mt-4 text-center text-sm">
        Já tem uma conta?{" "}
        <a href="/login" className="text-blue-600 hover:underline">
          Faça login
        </a>
      </p>
    </div>
  );
}