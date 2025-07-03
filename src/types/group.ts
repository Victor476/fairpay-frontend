// Tipo principal do grupo
export interface Group {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
  avatarUrl?: string; // Para compatibilidade
  totalExpenses: number;
  membersCount: number;
  createdAt?: string;
  createdBy?: {
    id: number;
    name: string;
  };
}

// Tipo para membro do grupo
export interface GroupMember {
  id: number;
  name: string;
  email: string;
  avatarUrl?: string;
  role?: string;
  joinedAt?: string;
  isActive?: boolean;
}

// Tipo para detalhes completos do grupo
export interface GroupDetails extends Group {
  members: GroupMember[];
  createdAt: string;
  updatedAt?: string;
}

// Tipo para criação de grupo (request)
export interface CreateGroupRequest {
  name: string;
  description?: string;
  imageUrl?: string;
}

// Tipo para resposta de criação de grupo
export interface CreateGroupResponse {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
  createdAt: string;
  createdBy: {
    id: number;
    name: string;
  };
}
