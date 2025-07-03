// Tipos relacionados a pagamentos manuais

export interface PaymentRequest {
  fromUserId: number;
  toUserId: number;
  amount: number;
  date?: string; // ISO date string, opcional (default: data atual)
  description?: string; // Opcional
}

export interface PaymentResponse {
  id: number;
  groupId: number;
  from: {
    id: number;
    name: string;
  };
  to: {
    id: number;
    name: string;
  };
  amount: number;
  date: string; // ISO date string
  description?: string;
  createdAt: string; // ISO date string
}

export interface PaymentFormData {
  fromUserId: string; // String para o select
  toUserId: string; // String para o select
  amount: string; // String para o input
  date: string; // String para o input date
  description: string;
}
