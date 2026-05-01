## Plan-4: 前端 - 分享页面与导出功能

### 目标
实现工作流分享功能（生成分享链接、设置分享选项）和分享查看页面（只读展示），以及Markdown导出功能。

### 涉及文件清单
- `src/app/share/[token]/page.tsx` — new（分享查看页面）
- `src/app/workflows/[id]/share/page.tsx` — new（分享管理页）
- `src/components/share/` — new（分享组件目录）
  - `share-modal.tsx` — 分享设置弹窗
  - `share-link-card.tsx` — 分享链接卡片
  - `share-settings-form.tsx` — 分享设置表单
  - `readonly-workflow-view.tsx` — 只读工作流展示
- `src/components/export/` — new（导出组件目录）
  - `export-button.tsx` — 导出按钮
  - `export-modal.tsx` — 导出选项弹窗
- `src/components/readonly/` — new（只读节点展示目录）
  - `readonly-standard-node.tsx`
  - `readonly-decision-node.tsx`
  - `readonly-parallel-node.tsx`
  - `readonly-loop-node.tsx`
  - `readonly-subflow-node.tsx`
  - `readonly-note-node.tsx`
- `src/hooks/use-share.ts` — new（分享功能Hook）
- `src/hooks/use-export.ts` — new（导出功能Hook）
- `src/lib/export-markdown.ts` — new（Markdown导出逻辑）

### 依赖项
- 依赖 Plan-1 的类型定义和基础组件
- 依赖 Plan-2 的工作流数据Hook
- 依赖 Plan-3 的节点展示组件（只读版本）

### 实现要点
1. **分享设置弹窗**
   - 触发：工作流详情页/编辑页的"分享"按钮
   - 选项：有效期（7天/30天/永久）、允许导出
   - 生成分享链接（带复制按钮）
   - 显示访问统计
   - 撤销分享按钮

2. **分享管理页** (`/workflows/[id]/share`)
   - 当前分享状态展示
   - 历史分享链接列表
   - 访问统计图表（简单展示）

3. **分享查看页** (`/share/[token]`)
   - 无需登录访问
   - 只读展示工作流内容
   - 显示工作流标题、描述、所有节点
   - 如果允许导出，显示导出按钮
   - 显示访问计数
   - 404页面（链接无效或过期）

4. **只读节点展示组件**
   - 复用Plan-3的节点展示逻辑，移除编辑功能
   - 标准节点：完整信息展示
   - 判断节点：分支可视化
   - 并行节点：任务列表+进度条
   - 循环节点：迭代历史
   - 子流程节点：子流程预览
   - 备注节点：提示框样式

5. **导出功能**
   - 导出按钮（工作流详情页、分享页）
   - 导出选项弹窗（目前仅支持Markdown）
   - Markdown生成逻辑
   - 文件下载

6. **Markdown生成规则**
   - 标题作为一级标题
   - 每个节点作为二级标题
   - 节点类型作为标签
   - 标准节点：人物、时间、地点、事件格式化
   - 判断节点：条件、分支表格
   - 并行节点：任务表格
   - 循环节点：迭代历史列表
   - 备注节点：引用块格式

### 预期验证方式
- `npm run dev` 启动正常
- 在工作流详情页点击分享按钮，生成分享链接
- 复制分享链接，在无痕窗口打开，能正常查看工作流
- 分享页面显示只读内容
- 可以导出Markdown文件
- 撤销分享后，链接无法访问

### 交付物清单
- [ ] 分享设置弹窗实现
- [ ] 分享管理页实现
- [ ] 分享查看页实现
- [ ] 分享链接卡片组件实现
- [ ] 分享设置表单实现
- [ ] 只读工作流展示组件实现
- [ ] 各类只读节点展示组件实现
- [ ] 导出按钮组件实现
- [ ] 导出选项弹窗实现
- [ ] Markdown导出逻辑实现
- [ ] 分享功能Hook实现
- [ ] 导出功能Hook实现
- [ ] 404错误页面实现
- [ ] 编译无错误

---

## Markdown导出格式示例

```typescript
// src/lib/export-markdown.ts

import { Workflow, WorkflowNode } from '@/types/workflow';

export function exportToMarkdown(workflow: Workflow): string {
  const lines: string[] = [];
  
  // 标题
  lines.push(`# ${workflow.title}`);
  lines.push('');
  
  // 描述
  if (workflow.description) {
    lines.push(`> ${workflow.description}`);
    lines.push('');
  }
  
  lines.push('---');
  lines.push('');
  
  // 节点
  workflow.nodes.forEach((node, index) => {
    lines.push(...renderNode(node, index + 1));
    lines.push('');
    lines.push('---');
    lines.push('');
  });
  
  // 页脚
  lines.push(`*导出时间: ${new Date().toLocaleString()}*`);
  
  return lines.join('\n');
}

function renderNode(node: WorkflowNode, stepNumber: number): string[] {
  const lines: string[] = [];
  
  // 节点标题
  lines.push(`## 步骤 ${stepNumber}: ${node.title}`);
  lines.push('');
  
  // 节点类型标签
  const typeLabels: Record<string, string> = {
    standard: '标准节点',
    decision: '判断节点',
    parallel: '并行节点',
    loop: '循环节点',
    subflow: '子流程节点',
    note: '备注节点'
  };
  lines.push(`**类型**: ${typeLabels[node.type]}`);
  lines.push('');
  
  switch (node.type) {
    case 'standard':
      return lines.concat(renderStandardNode(node));
    case 'decision':
      return lines.concat(renderDecisionNode(node));
    case 'parallel':
      return lines.concat(renderParallelNode(node));
    case 'loop':
      return lines.concat(renderLoopNode(node));
    case 'subflow':
      return lines.concat(renderSubflowNode(node));
    case 'note':
      return lines.concat(renderNoteNode(node));
    default:
      return lines;
  }
}

function renderStandardNode(node: Extract<WorkflowNode, { type: 'standard' }>): string[] {
  const lines: string[] = [];
  const { data } = node;
  
  if (data.characters?.length) {
    lines.push(`**人物**: ${data.characters.join('、')}`);
    lines.push('');
  }
  
  if (data.scheduledAt) {
    lines.push(`**时间**: ${new Date(data.scheduledAt).toLocaleString()}`);
    lines.push('');
  }
  
  if (data.location) {
    lines.push(`**地点**: ${data.location}`);
    lines.push('');
  }
  
  if (data.event?.content) {
    lines.push('**事件内容**:');
    lines.push(data.event.content);
    lines.push('');
  }
  
  if (data.tags?.length) {
    lines.push(`**标签**: ${data.tags.map(t => `#${t}`).join(' ')}`);
    lines.push('');
  }
  
  if (data.status) {
    const statusLabels: Record<string, string> = {
      pending: '待开始',
      'in-progress': '进行中',
      completed: '已完成',
      skipped: '已跳过'
    };
    lines.push(`**状态**: ${statusLabels[data.status]}`);
    lines.push('');
  }
  
  return lines;
}

function renderDecisionNode(node: Extract<WorkflowNode, { type: 'decision' }>): string[] {
  const lines: string[] = [];
  const { data } = node;
  
  lines.push(`**判断条件**: ${data.condition}`);
  lines.push('');
  lines.push('**分支**:');
  lines.push('');
  
  data.branches.forEach(branch => {
    lines.push(`- ${branch.label}${branch.condition ? ` (${branch.condition})` : ''}${branch.description ? `: ${branch.description}` : ''}`);
  });
  
  lines.push('');
  return lines;
}

function renderParallelNode(node: Extract<WorkflowNode, { type: 'parallel' }>): string[] {
  const lines: string[] = [];
  const { data } = node;
  
  if (data.description) {
    lines.push(`**说明**: ${data.description}`);
    lines.push('');
  }
  
  lines.push('**并行任务**:');
  lines.push('');
  lines.push('| 任务 | 负责人 | 状态 | 优先级 |');
  lines.push('|------|--------|------|--------|');
  
  data.tasks.forEach(task => {
    const statusLabels: Record<string, string> = {
      pending: '待开始',
      'in-progress': '进行中',
      completed: '已完成'
    };
    const priorityLabels: Record<string, string> = {
      low: '低',
      medium: '中',
      high: '高'
    };
    lines.push(`| ${task.title} | ${task.assignee || '-'} | ${statusLabels[task.status || 'pending']} | ${priorityLabels[task.priority || 'medium']} |`);
  });
  
  lines.push('');
  return lines;
}

function renderLoopNode(node: Extract<WorkflowNode, { type: 'loop' }>): string[] {
  const lines: string[] = [];
  const { data } = node;
  
  lines.push(`**循环类型**: ${data.loopType === 'fixed' ? '固定次数' : '条件循环'}`);
  lines.push('');
  
  if (data.maxIterations) {
    lines.push(`**最大迭代次数**: ${data.maxIterations}`);
    lines.push('');
  }
  
  if (data.exitCondition) {
    lines.push(`**退出条件**: ${data.exitCondition}`);
    lines.push('');
  }
  
  if (data.iterations?.length) {
    lines.push('**迭代历史**:');
    lines.push('');
    data.iterations.forEach(iter => {
      lines.push(`- 第${iter.iteration}次: ${iter.result || '无结果'}${iter.feedback ? ` (反馈: ${iter.feedback})` : ''}`);
    });
    lines.push('');
  }
  
  return lines;
}

function renderSubflowNode(node: Extract<WorkflowNode, { type: 'subflow' }>): string[] {
  const lines: string[] = [];
  const { data } = node;
  
  lines.push(`**子流程类型**: ${data.subflowType === 'embedded' ? '嵌入式' : '外部引用'}`);
  lines.push('');
  
  if (data.externalWorkflowId) {
    lines.push(`**引用工作流ID**: ${data.externalWorkflowId}`);
    lines.push('');
  }
  
  return lines;
}

function renderNoteNode(node: Extract<WorkflowNode, { type: 'note' }>): string[] {
  const lines: string[] = [];
  const { data } = node;
  
  const typeEmojis: Record<string, string> = {
    info: 'ℹ️',
    warning: '⚠️',
    success: '✅',
    error: '❌',
    tip: '💡'
  };
  
  lines.push(`${typeEmojis[data.noteType] || 'ℹ️'} **${data.noteType.toUpperCase()}**`);
  lines.push('');
  lines.push(data.content);
  lines.push('');
  
  return lines;
}
```
