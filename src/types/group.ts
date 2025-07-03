export interface Group {
  id: number;
  name: string;
  description?: string;
  avatarUrl?: string;
  totalExpenses: number;
  membersCount: number;
}

export interface GroupMember {
  id: number;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface GroupDetails extends Group {
  members: GroupMember[];
  createdAt: string;
  updatedAt: string;
}
