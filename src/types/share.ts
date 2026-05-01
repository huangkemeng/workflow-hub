export interface ShareLink {
  id: string;
  workflowId: string;
  token: string;
  expiresAt: string | null;
  allowExport: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateShareRequest {
  expiresInDays: number | null; // null 表示永久
  allowExport: boolean;
}

export interface ShareSettings {
  expiresInDays: number | null;
  allowExport: boolean;
}

export const EXPIRY_OPTIONS = [
  { value: 7, label: '7天' },
  { value: 30, label: '30天' },
  { value: null, label: '永久有效' },
] as const;
