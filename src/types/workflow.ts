import { WorkflowNode } from './node';

export interface Workflow {
  id: string;
  title: string;
  description?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  userId: string;
  nodes: WorkflowNode[];
  currentVersion: number;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowVersion {
  id: string;
  workflowId: string;
  version: number;
  title: string;
  description?: string;
  nodes: WorkflowNode[];
  createdAt: string;
  changeSummary?: string;
}

export interface ShareInfo {
  shareToken: string;
  shareUrl: string;
  expiresAt?: string;
  isActive: boolean;
  viewCount: number;
  allowExport: boolean;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
}

export interface WorkflowListItem {
  id: string;
  title: string;
  description?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  nodeCount: number;
  updatedAt: string;
}
