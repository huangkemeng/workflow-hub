import { Workflow, WorkflowListItem, WorkflowVersion, User } from '@/types/workflow';

export const mockUser: User = {
  id: 'user-1',
  email: 'user@example.com',
  name: '张三',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'
};

export const mockWorkflows: WorkflowListItem[] = [
  {
    id: 'wf-1',
    title: '产品上线流程',
    description: '描述产品从开发到上线的完整流程',
    status: 'DRAFT',
    nodeCount: 5,
    updatedAt: '2026-05-01T12:00:00Z'
  },
  {
    id: 'wf-2',
    title: '需求评审流程',
    description: '产品需求评审的标准流程',
    status: 'PUBLISHED',
    nodeCount: 3,
    updatedAt: '2026-04-28T10:30:00Z'
  },
  {
    id: 'wf-3',
    title: '代码审查流程',
    description: '团队代码审查规范流程',
    status: 'ARCHIVED',
    nodeCount: 4,
    updatedAt: '2026-04-15T09:00:00Z'
  }
];

export const mockWorkflowDetail: Workflow = {
  id: 'wf-1',
  title: '产品上线流程',
  description: '描述产品从开发到上线的完整流程',
  status: 'DRAFT',
  userId: 'user-1',
  nodes: [
    {
      id: 'node-1',
      type: 'standard',
      title: '需求评审会议',
      position: 1,
      data: {
        characters: ['产品经理', '技术负责人', 'UI设计师'],
        scheduledAt: '2026-05-10T14:00:00Z',
        location: '会议室A',
        event: {
          content: '1. 产品经理讲解需求背景和目标\n2. 技术负责人评估技术可行性\n3. UI设计师展示初步设计方案',
          format: 'rich-text'
        },
        tags: ['重要', '评审', '里程碑'],
        status: 'pending'
      },
      config: {
        color: '#1890ff',
        icon: 'check-circle'
      }
    },
    {
      id: 'node-2',
      type: 'decision',
      title: '技术方案评审结果',
      position: 2,
      data: {
        condition: '技术方案评审得分是否 ≥ 80分？',
        decisionType: 'binary',
        branches: [
          {
            id: 'branch-yes',
            label: '通过',
            condition: '评审得分 ≥ 80分',
            color: '#52c41a',
            description: '进入开发阶段'
          },
          {
            id: 'branch-no',
            label: '不通过',
            condition: '评审得分 < 80分',
            color: '#f5222d',
            description: '返回修改方案'
          }
        ]
      }
    }
  ],
  currentVersion: 3,
  createdAt: '2026-05-01T10:00:00Z',
  updatedAt: '2026-05-01T12:00:00Z'
};

export const mockVersions: WorkflowVersion[] = [
  {
    id: 'ver-3',
    workflowId: 'wf-1',
    version: 3,
    title: '产品上线流程',
    description: '描述产品从开发到上线的完整流程',
    nodes: [],
    createdAt: '2026-05-01T12:00:00Z',
    changeSummary: '添加了判断节点'
  },
  {
    id: 'ver-2',
    workflowId: 'wf-1',
    version: 2,
    title: '产品上线流程',
    description: '描述产品从开发到上线的完整流程',
    nodes: [],
    createdAt: '2026-05-01T11:00:00Z',
    changeSummary: '更新了标准节点内容'
  },
  {
    id: 'ver-1',
    workflowId: 'wf-1',
    version: 1,
    title: '产品上线流程',
    description: '描述产品从开发到上线的完整流程',
    nodes: [],
    createdAt: '2026-05-01T10:00:00Z',
    changeSummary: '初始版本'
  }
];
