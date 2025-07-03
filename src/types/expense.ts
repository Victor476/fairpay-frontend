// Tipos relacionados a despesas

export interface ExpenseParticipant {
  id: number;
  name: string;
  email: string;
  share: number; // Valor que deve pagar
}

export interface Expense {
  id: number;
  description: string;
  amount: number;
  totalAmount: number;
  expenseDate: string;
  createdAt: string;
  categoryId?: number;
  paidBy: {
    id: number;
    name: string;
    email: string;
  };
  createdBy: {
    id: number;
    name: string;
    email: string;
  };
  group: {
    id: number;
    name: string;
  };
  participants: ExpenseParticipant[];
}

export interface CreateExpenseRequest {
  description: string;
  totalAmount: number;
  date: string; // Será convertido para LocalDate no backend
  groupId: number;
  payer: string; // Email do pagador
  participants: string[]; // Lista de emails dos participantes
  categoryId?: number; // Opcional
}

export interface CreateExpenseResponse extends Expense {
  // Herda todos os campos de Expense
}

// Tipo para validação de formulário
export interface ExpenseFormData {
  description: string;
  totalAmount: string; // String para input, será convertido para number
  date: string;
  payer: string;
  participants: string[];
}
