"use server";

import { fetchPublicApi } from "@/lib/api";

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}) {
  try {
    // Verificar se as senhas conferem
    if (data.password !== data.confirmPassword) {
      return {
        success: false,
        message: "As senhas não conferem",
      };
    }

    // Enviar todos os campos, incluindo confirmPassword
    const result = await fetchPublicApi("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword
      }),
    });

    return {
      success: true,
      message: "Conta criada com sucesso!",
      user: result.user || result,
    };
  } catch (error) {
    console.error("Erro ao registrar usuário:", error);
    return {
      success: false,
      message: error instanceof Error 
        ? error.message 
        : "Ocorreu um erro durante o registro",
    };
  }
}