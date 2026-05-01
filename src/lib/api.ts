import { Workflow, WorkflowListItem, WorkflowVersion } from '@/types/workflow';
import { mockWorkflows, mockWorkflowDetail, mockVersions } from '@/data/mock';

// 模拟 API 延迟
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  // 获取工作流列表
  async getWorkflows(params?: {
    search?: string;
    status?: string;
    sort?: string;
    page?: number;
    limit?: number;
  }): Promise<{ workflows: WorkflowListItem[]; total: number }> {
    await delay(500);
    
    let workflows = [...mockWorkflows];
    
    // 搜索过滤
    if (params?.search) {
      const searchLower = params.search.toLowerCase();
      workflows = workflows.filter(
        w =>
          w.title.toLowerCase().includes(searchLower) ||
          w.description?.toLowerCase().includes(searchLower)
      );
    }
    
    // 状态过滤
    if (params?.status && params.status !== 'all') {
      workflows = workflows.filter(w => w.status === params.status);
    }
    
    // 排序
    if (params?.sort) {
      switch (params.sort) {
        case 'updated-desc':
          workflows.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
          break;
        case 'updated-asc':
          workflows.sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());
          break;
        case 'title-asc':
          workflows.sort((a, b) => a.title.localeCompare(b.title));
          break;
        case 'title-desc':
          workflows.sort((a, b) => b.title.localeCompare(a.title));
          break;
      }
    }
    
    const total = workflows.length;
    
    // 分页
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const start = (page - 1) * limit;
    const end = start + limit;
    workflows = workflows.slice(start, end);
    
    return { workflows, total };
  },

  // 获取工作流详情
  async getWorkflow(id: string): Promise<Workflow | null> {
    await delay(500);
    if (id === 'wf-1') {
      return mockWorkflowDetail;
    }
    return null;
  },

  // 创建工作流
  async createWorkflow(data: {
    title: string;
    description?: string;
  }): Promise<Workflow> {
    await delay(500);
    const newWorkflow: Workflow = {
      id: `wf-${Date.now()}`,
      title: data.title,
      description: data.description,
      status: 'DRAFT',
      userId: 'user-1',
      nodes: [],
      currentVersion: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return newWorkflow;
  },

  // 删除工作流
  async deleteWorkflow(id: string): Promise<void> {
    await delay(500);
    console.log('Deleted workflow:', id);
  },

  // 获取版本历史
  async getVersions(workflowId: string): Promise<WorkflowVersion[]> {
    await delay(500);
    if (workflowId === 'wf-1') {
      return mockVersions;
    }
    return [];
  },

  // 回滚到指定版本
  async rollbackVersion(workflowId: string, versionId: string): Promise<void> {
    await delay(500);
    console.log('Rolled back workflow:', workflowId, 'to version:', versionId);
  }
};
