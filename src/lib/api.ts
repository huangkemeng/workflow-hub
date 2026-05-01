import { Workflow, WorkflowListItem, WorkflowVersion } from '@/types/workflow';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

async function fetchApi<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: '请求失败' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

export const api = {
  // 获取工作流列表
  async getWorkflows(params?: {
    search?: string;
    status?: string;
    sort?: string;
    page?: number;
    limit?: number;
  }): Promise<{ workflows: WorkflowListItem[]; total: number }> {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.set('search', params.search);
    if (params?.status && params.status !== 'all') queryParams.set('status', params.status);
    if (params?.sort) queryParams.set('sort', params.sort);
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());

    const query = queryParams.toString();
    return fetchApi(`/api/workflows${query ? `?${query}` : ''}`);
  },

  // 获取工作流详情
  async getWorkflow(id: string): Promise<Workflow | null> {
    try {
      return await fetchApi<Workflow>(`/api/workflows/${id}`);
    } catch (error) {
      if ((error as Error).message.includes('404')) {
        return null;
      }
      throw error;
    }
  },

  // 创建工作流
  async createWorkflow(data: {
    title: string;
    description?: string;
  }): Promise<Workflow> {
    return fetchApi<Workflow>('/api/workflows', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // 更新工作流
  async updateWorkflow(
    id: string,
    data: { title?: string; description?: string; nodes?: any[] }
  ): Promise<Workflow> {
    return fetchApi<Workflow>(`/api/workflows/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // 删除工作流
  async deleteWorkflow(id: string): Promise<void> {
    await fetchApi(`/api/workflows/${id}`, {
      method: 'DELETE',
    });
  },

  // 获取版本历史
  async getVersions(workflowId: string): Promise<WorkflowVersion[]> {
    return fetchApi<WorkflowVersion[]>(`/api/workflows/${workflowId}/versions`);
  },

  // 回滚到指定版本
  async rollbackVersion(workflowId: string, versionId: string): Promise<void> {
    await fetchApi(`/api/workflows/${workflowId}/versions/${versionId}/rollback`, {
      method: 'POST',
    });
  },

  // 导出工作流
  async exportWorkflow(workflowId: string, format: string): Promise<{ content: string; filename: string }> {
    return fetchApi(`/api/workflows/${workflowId}/export?format=${format}`);
  },

  // 创建分享链接
  async createShare(workflowId: string, data: { expiresInDays?: number | null; allowExport?: boolean }): Promise<any> {
    return fetchApi(`/api/workflows/${workflowId}/share`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // 获取分享链接列表
  async getShares(workflowId: string): Promise<any[]> {
    return fetchApi<any[]>(`/api/workflows/${workflowId}/share`);
  },

  // 撤销分享
  async revokeShare(workflowId: string, shareId: string): Promise<void> {
    await fetchApi(`/api/workflows/${workflowId}/share/${shareId}`, {
      method: 'DELETE',
    });
  },

  // 获取分享的 workflow
  async getSharedWorkflow(token: string): Promise<any> {
    return fetchApi(`/api/share/${token}`);
  },

  // 发布工作流
  async publishWorkflow(workflowId: string): Promise<void> {
    await fetchApi(`/api/workflows/${workflowId}/publish`, {
      method: 'POST',
    });
  },

  // 取消发布工作流
  async unpublishWorkflow(workflowId: string): Promise<void> {
    await fetchApi(`/api/workflows/${workflowId}/unpublish`, {
      method: 'POST',
    });
  },

  // 归档工作流
  async archiveWorkflow(workflowId: string): Promise<void> {
    await fetchApi(`/api/workflows/${workflowId}/archive`, {
      method: 'POST',
    });
  },

  // 恢复工作流
  async restoreWorkflow(workflowId: string): Promise<void> {
    await fetchApi(`/api/workflows/${workflowId}/restore`, {
      method: 'POST',
    });
  },

  // 通用 HTTP 方法（向后兼容）
  async get(url: string): Promise<{ data: any }> {
    const data = await fetchApi<any>(url);
    return { data };
  },

  async post(url: string, body?: any): Promise<{ data: any }> {
    const data = await fetchApi<any>(url, {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return { data };
  },

  async delete(url: string): Promise<void> {
    await fetchApi(url, {
      method: 'DELETE',
    });
  },
};
