## Plan-1: 前端 - 项目初始化与基础组件

### 目标
初始化Next.js项目，配置Tailwind CSS、TypeScript，创建基础布局组件、认证系统、全局状态管理，以及节点类型定义。

### 涉及文件清单
- `package.json` — new
- `tailwind.config.ts` — new
- `src/app/globals.css` — new
- `src/app/layout.tsx` — new
- `src/app/page.tsx` — new
- `src/app/login/page.tsx` — new
- `src/components/ui/` — new（基础UI组件目录）
  - `button.tsx`
  - `input.tsx`
  - `card.tsx`
  - `dialog.tsx`
  - `dropdown-menu.tsx`
- `src/components/layout/` — new（布局组件目录）
  - `header.tsx`
  - `sidebar.tsx`
- `src/lib/utils.ts` — new（工具函数）
- `src/lib/auth.ts` — new（前端认证逻辑）
- `src/types/workflow.ts` — new（工作流类型定义）
- `src/types/node.ts` — new（节点类型定义）
- `src/hooks/use-auth.ts` — new（认证Hook）
- `src/providers/auth-provider.tsx` — new（认证上下文）
- `next.config.js` — new
- `tsconfig.json` — new

### 依赖项
- 无前置依赖，这是第一个前端计划
- 使用mock数据进行开发测试（不依赖后端API）

### 实现要点
1. **项目配置**
   - Next.js 14 + App Router
   - TypeScript严格模式
   - Tailwind CSS + shadcn/ui 组件风格
   - 使用Lucide React作为图标库

2. **类型定义（核心）**
   - 定义6种节点类型的TypeScript接口
   - 定义工作流、用户、分享等数据类型
   - 确保类型与后端PRD保持一致

3. **认证系统**
   - 使用NextAuth.js进行会话管理
   - 登录页面UI
   - 受保护路由中间件

4. **基础布局**
   - 顶部导航栏（Logo、用户信息、登出）
   - 侧边栏（导航菜单）
   - 响应式设计（移动端适配）

5. **UI组件库**
   - 使用shadcn/ui风格的基础组件
   - Button、Input、Card、Dialog等
   - 统一的配色方案（蓝色主题）

### 预期验证方式
- `npm run dev` 启动正常
- 访问 `http://localhost:3000` 看到首页
- 访问 `http://localhost:3000/login` 看到登录页面
- 页面布局正确，样式正常
- TypeScript编译无错误

### 交付物清单
- [ ] Next.js项目初始化完成
- [ ] Tailwind CSS配置完成
- [ ] TypeScript配置完成
- [ ] 基础UI组件创建完成（Button, Input, Card, Dialog）
- [ ] 布局组件创建完成（Header, Sidebar）
- [ ] 认证系统配置完成
- [ ] 登录页面实现
- [ ] 节点类型定义完成
- [ ] 工作流类型定义完成
- [ ] 首页基础框架实现
- [ ] 编译无错误

---

## 节点类型定义（TypeScript）

```typescript
// src/types/node.ts

export type NodeType = 'standard' | 'decision' | 'parallel' | 'loop' | 'subflow' | 'note';

export interface BaseNode {
  id: string;
  type: NodeType;
  title: string;
  position: number;
  config?: NodeConfig;
}

export interface NodeConfig {
  showInTimeline?: boolean;
  color?: string;
  icon?: string;
}

// 标准节点
export interface StandardNode extends BaseNode {
  type: 'standard';
  data: {
    characters?: string[];
    scheduledAt?: string;
    location?: string;
    event?: {
      content: string;
      format: 'rich-text' | 'markdown' | 'plain';
    };
    attachments?: Attachment[];
    tags?: string[];
    status?: 'pending' | 'in-progress' | 'completed' | 'skipped';
  };
}

export interface Attachment {
  name: string;
  url: string;
  type: string;
}

// 判断节点
export interface DecisionNode extends BaseNode {
  type: 'decision';
  data: {
    condition: string;
    decisionType: 'binary' | 'multiple';
    branches: Branch[];
    defaultBranch?: string;
  };
}

export interface Branch {
  id: string;
  label: string;
  condition?: string;
  color?: string;
  nextNodeId?: string;
  description?: string;
}

// 并行节点
export interface ParallelNode extends BaseNode {
  type: 'parallel';
  data: {
    description?: string;
    tasks: ParallelTask[];
    completionCondition: 'all' | 'any' | 'majority' | 'n';
    completionCount?: number;
    syncPoint?: {
      enabled: boolean;
      description?: string;
    };
  };
}

export interface ParallelTask {
  id: string;
  title: string;
  assignee?: string;
  status?: 'pending' | 'in-progress' | 'completed';
  priority?: 'low' | 'medium' | 'high';
  estimatedHours?: number;
  dependencies?: string[];
}

// 循环节点
export interface LoopNode extends BaseNode {
  type: 'loop';
  data: {
    loopType: 'fixed' | 'conditional';
    maxIterations?: number;
    exitCondition?: string;
    iterations?: LoopIteration[];
  };
}

export interface LoopIteration {
  id: string;
  iteration: number;
  result?: string;
  feedback?: string;
  completedAt?: string;
}

// 子流程节点
export interface SubflowNode extends BaseNode {
  type: 'subflow';
  data: {
    subflowType: 'embedded' | 'external';
    externalWorkflowId?: string;
    embeddedNodes?: WorkflowNode[];
    inputMapping?: Record<string, string>;
    outputMapping?: Record<string, string>;
  };
}

// 备注节点
export interface NoteNode extends BaseNode {
  type: 'note';
  data: {
    noteType: 'info' | 'warning' | 'success' | 'error' | 'tip';
    content: string;
    isCollapsible?: boolean;
    defaultCollapsed?: boolean;
  };
}

export type WorkflowNode = StandardNode | DecisionNode | ParallelNode | LoopNode | SubflowNode | NoteNode;
```

---

## 工作流类型定义

```typescript
// src/types/workflow.ts

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
```
