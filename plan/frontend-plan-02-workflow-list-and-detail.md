## Plan-2: 前端 - 工作流列表与详情页面

### 目标
实现工作流列表页面（展示、搜索、筛选、分页）和工作流详情页面（基本信息展示、版本历史查看），以及创建工作流的入口。

### 涉及文件清单
- `src/app/workflows/page.tsx` — new（工作流列表页）
- `src/app/workflows/[id]/page.tsx` — new（工作流详情页）
- `src/app/workflows/[id]/versions/page.tsx` — new（版本历史页）
- `src/app/workflows/new/page.tsx` — new（创建工作流页）
- `src/components/workflow/` — new（工作流组件目录）
  - `workflow-card.tsx` — 工作流卡片组件
  - `workflow-list.tsx` — 工作流列表组件
  - `workflow-filters.tsx` — 筛选组件
  - `workflow-search.tsx` — 搜索组件
  - `version-timeline.tsx` — 版本时间线组件
- `src/components/modals/` — new（弹窗组件目录）
  - `create-workflow-modal.tsx` — 创建工作流弹窗
  - `delete-workflow-modal.tsx` — 删除确认弹窗
- `src/hooks/use-workflows.ts` — new（工作流数据Hook）
- `src/lib/api.ts` — new（API调用封装）
- `src/data/mock.ts` — new（Mock数据）

### 依赖项
- 依赖 Plan-1 的基础组件和类型定义
- 依赖 Plan-1 的布局组件
- 使用mock数据进行开发（不依赖真实后端）

### 实现要点
1. **工作流列表页** (`/workflows`)
   - 顶部操作栏：新建按钮、搜索框
   - 筛选栏：状态筛选、排序选择
   - 工作流卡片网格/列表展示
   - 分页组件
   - 空状态展示

2. **工作流卡片组件**
   - 显示标题、描述（截断）
   - 显示节点数量、更新时间
   - 状态标签（草稿/已发布/已归档）
   - 操作按钮：编辑、分享、删除

3. **创建工作流页** (`/workflows/new`)
   - 表单：标题（必填）、描述（可选）
   - 标签选择（可选）
   - 创建后跳转到工作流编辑页

4. **工作流详情页** (`/workflows/[id]`)
   - 基本信息展示（标题、描述、状态）
   - 节点预览列表（简化展示）
   - 操作按钮：编辑、分享、导出、查看版本
   - 统计信息（节点数、创建时间、更新时间）

5. **版本历史页** (`/workflows/[id]/versions`)
   - 时间线展示版本列表
   - 每个版本显示：版本号、修改时间、变更摘要
   - 回滚按钮（带确认弹窗）
   - 版本对比（可选）

6. **数据管理**
   - 使用React Query或SWR进行数据获取
   - 实现乐观更新
   - 错误处理和加载状态

### 预期验证方式
- `npm run dev` 启动正常
- 访问 `http://localhost:3000/workflows` 看到工作流列表
- 可以搜索、筛选工作流
- 点击工作流卡片进入详情页
- 可以创建新工作流
- 可以查看版本历史

### 交付物清单
- [ ] 工作流列表页实现
- [ ] 工作流卡片组件实现
- [ ] 搜索筛选功能实现
- [ ] 创建工作流页实现
- [ ] 工作流详情页实现
- [ ] 版本历史页实现
- [ ] 版本时间线组件实现
- [ ] 创建/删除弹窗实现
- [ ] 数据Hook实现
- [ ] Mock数据配置
- [ ] 页面导航正常
- [ ] 编译无错误

---

## Mock数据示例

```typescript
// src/data/mock.ts

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
```
