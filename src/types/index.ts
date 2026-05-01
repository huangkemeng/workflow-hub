import { WorkflowStatus } from '@prisma/client'

// User Types
export interface User {
  id: string
  email: string
  name: string | null
  avatar: string | null
  createdAt: Date
  updatedAt: Date
}

// Workflow Types
export interface Workflow {
  id: string
  title: string
  description: string | null
  status: WorkflowStatus
  userId: string
  createdAt: Date
  updatedAt: Date
}

export interface WorkflowListItem {
  id: string
  title: string
  description: string | null
  status: WorkflowStatus
  nodeCount: number
  updatedAt: Date
}

export interface WorkflowDetail extends Workflow {
  nodes: WorkflowNode[]
  currentVersion: number
}

// Workflow Node Types
export type NodeType = 'standard' | 'decision' | 'parallel' | 'loop' | 'subflow' | 'note'

export interface WorkflowNode {
  id: string
  type: NodeType
  title: string
  position: number
  data: Record<string, unknown>
  config?: Record<string, unknown>
}

// Workflow Version Types
export interface WorkflowVersion {
  id: string
  workflowId: string
  version: number
  title: string
  description: string | null
  nodes: WorkflowNode[]
  createdAt: Date
}

export interface VersionListItem {
  id: string
  version: number
  title: string
  createdAt: Date
  changeSummary: string
}

// Share Types
export interface Share {
  id: string
  workflowId: string
  shareToken: string
  expiresAt: Date | null
  isActive: boolean
  viewCount: number
  allowExport: boolean
  createdAt: Date
}

export interface ShareCreateInput {
  expiresIn?: '7d' | '30d' | null
  allowExport?: boolean
}

export interface ShareResponse {
  shareToken: string
  shareUrl: string
  expiresAt: Date | null
  allowExport: boolean
}

// API Response Types
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Query Parameters
export interface WorkflowListQuery {
  page?: number
  limit?: number
  search?: string
  sort?: 'createdAt' | 'updatedAt' | 'title'
  order?: 'asc' | 'desc'
}

// Create/Update Inputs
export interface CreateWorkflowInput {
  title: string
  description?: string
}

export interface UpdateWorkflowInput {
  title?: string
  description?: string
  nodes?: WorkflowNode[]
}

// Rollback Response
export interface RollbackResponse {
  success: boolean
  newVersion: number
  message: string
}
