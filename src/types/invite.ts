// Tipos relacionados a convites de grupo

export interface GroupInviteLinkRequest {
  expiresInDays?: number; // Padrão: 7 dias
}

export interface GroupInviteLinkResponse {
  inviteLink: string; // URL completa do convite
  expiresAt: string; // ISO string
}

export interface GroupJoinResponse {
  message: string;
  group: {
    id: number;
    name: string;
    createdAt: string;
    createdBy: {
      id: number;
      name: string;
    };
  };
}

export interface AcceptGroupInviteResponse {
  message: string;
  group: {
    id: number;
    name: string;
    createdAt: string;
    createdBy: {
      id: number;
      name: string;
    };
  };
}
