## Plan-3: 前端 - 节点编辑器与画布

### 目标
实现工作流编辑器核心功能，包括节点类型选择器、各类节点的编辑表单、节点画布展示、节点连接关系管理。

### 涉及文件清单
- `src/app/workflows/[id]/edit/page.tsx` — new（工作流编辑页）
- `src/components/canvas/` — new（画布组件目录）
  - `workflow-canvas.tsx` — 工作流画布主组件
  - `node-renderer.tsx` — 节点渲染器
  - `connection-line.tsx` — 连接线组件
  - `canvas-toolbar.tsx` — 画布工具栏
- `src/components/node-editor/` — new（节点编辑器目录）
  - `node-type-selector.tsx` — 节点类型选择器
  - `standard-node-form.tsx` — 标准节点表单
  - `decision-node-form.tsx` — 判断节点表单
  - `parallel-node-form.tsx` — 并行节点表单
  - `loop-node-form.tsx` — 循环节点表单
  - `subflow-node-form.tsx` — 子流程节点表单
  - `note-node-form.tsx` — 备注节点表单
- `src/components/node-view/` — new（节点展示组件目录）
  - `standard-node-view.tsx` — 标准节点展示
  - `decision-node-view.tsx` — 判断节点展示
  - `parallel-node-view.tsx` — 并行节点展示
  - `loop-node-view.tsx` — 循环节点展示
  - `subflow-node-view.tsx` — 子流程节点展示
  - `note-node-view.tsx` — 备注节点展示
- `src/components/node-card/` — new（节点卡片目录）
  - `base-node-card.tsx` — 基础节点卡片
- `src/hooks/use-node-editor.ts` — new（节点编辑Hook）
- `src/hooks/use-workflow-canvas.ts` — new（画布操作Hook）
- `src/lib/node-utils.ts` — new（节点工具函数）

### 依赖项
- 依赖 Plan-1 的类型定义和基础组件
- 依赖 Plan-2 的工作流数据Hook
- 使用mock数据进行开发

### 实现要点
1. **工作流编辑页** (`/workflows/[id]/edit`)
   - 左侧：节点类型选择器面板
   - 中央：画布区域（节点展示和编辑）
   - 右侧：节点属性编辑面板
   - 顶部：工具栏（保存、预览、返回）

2. **节点类型选择器**
   - 6种节点类型的图标卡片展示
   - 点击添加到画布
   - 显示节点类型说明

3. **节点渲染系统**
   - 根据节点类型渲染不同UI
   - 标准节点：人物、时间、地点、事件展示
   - 判断节点：条件 + 分支可视化
   - 并行节点：任务列表 + 进度
   - 循环节点：迭代历史展示
   - 子流程节点：子流程引用展示
   - 备注节点：提示框样式

4. **节点编辑表单**
   - 每种节点类型独立的表单组件
   - 表单验证（必填项、格式）
   - 实时预览更新

5. **画布交互**
   - 节点拖拽排序（调整position）
   - 节点选中/取消选中
   - 节点删除（带确认）
   - 节点间连接线（简单的顺序连接）

6. **保存机制**
   - 自动保存（防抖）
   - 手动保存按钮
   - 保存时创建新版本
   - 未保存离开提示

### 预期验证方式
- `npm run dev` 启动正常
- 进入工作流编辑页
- 可以添加不同类型的节点
- 可以编辑节点内容
- 可以删除节点
- 可以保存工作流
- 节点展示符合PRD中的界面描述

### 交付物清单
- [ ] 工作流编辑页实现
- [ ] 画布主组件实现
- [ ] 节点类型选择器实现
- [ ] 标准节点表单实现
- [ ] 判断节点表单实现
- [ ] 并行节点表单实现
- [ ] 循环节点表单实现
- [ ] 子流程节点表单实现
- [ ] 备注节点表单实现
- [ ] 各类节点展示组件实现
- [ ] 节点拖拽排序实现
- [ ] 节点连接关系展示
- [ ] 自动保存机制实现
- [ ] 节点工具函数封装
- [ ] 编译无错误

---

## 节点编辑器表单结构

### 标准节点表单字段
```typescript
interface StandardNodeFormData {
  title: string;
  characters: string[];        // 多选输入，支持添加新人物
  scheduledAt?: string;        // 日期时间选择器
  location?: string;           // 文本输入
  eventContent: string;        // 富文本编辑器
  tags: string[];              // 标签输入
  status: 'pending' | 'in-progress' | 'completed' | 'skipped';
  color?: string;              // 颜色选择器
}
```

### 判断节点表单字段
```typescript
interface DecisionNodeFormData {
  title: string;
  condition: string;           // 文本输入
  decisionType: 'binary' | 'multiple';
  branches: {
    id: string;
    label: string;
    condition?: string;
    color?: string;
    description?: string;
  }[];
  defaultBranch?: string;
}
```

### 并行节点表单字段
```typescript
interface ParallelNodeFormData {
  title: string;
  description?: string;
  tasks: {
    id: string;
    title: string;
    assignee?: string;
    status: 'pending' | 'in-progress' | 'completed';
    priority: 'low' | 'medium' | 'high';
    estimatedHours?: number;
  }[];
  completionCondition: 'all' | 'any' | 'majority' | 'n';
  completionCount?: number;    // 当condition为'n'时显示
  syncPointEnabled: boolean;
  syncPointDescription?: string;
}
```

### 循环节点表单字段
```typescript
interface LoopNodeFormData {
  title: string;
  loopType: 'fixed' | 'conditional';
  maxIterations?: number;      // 固定次数时必填
  exitCondition?: string;      // 条件循环时必填
}
```

### 子流程节点表单字段
```typescript
interface SubflowNodeFormData {
  title: string;
  subflowType: 'embedded' | 'external';
  externalWorkflowId?: string; // 外部工作流选择器
}
```

### 备注节点表单字段
```typescript
interface NoteNodeFormData {
  title: string;
  noteType: 'info' | 'warning' | 'success' | 'error' | 'tip';
  content: string;             // 富文本编辑器
  isCollapsible: boolean;
  defaultCollapsed: boolean;
}
```
