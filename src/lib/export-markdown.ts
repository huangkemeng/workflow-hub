import { Workflow } from '@/types/workflow';
import { WorkflowNode, StandardNode, DecisionNode, ParallelNode, LoopNode, SubflowNode, NoteNode } from '@/types/node';

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
  workflow.nodes?.forEach((node, index) => {
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
      return lines.concat(renderStandardNode(node as StandardNode));
    case 'decision':
      return lines.concat(renderDecisionNode(node as DecisionNode));
    case 'parallel':
      return lines.concat(renderParallelNode(node as ParallelNode));
    case 'loop':
      return lines.concat(renderLoopNode(node as LoopNode));
    case 'subflow':
      return lines.concat(renderSubflowNode(node as SubflowNode));
    case 'note':
      return lines.concat(renderNoteNode(node as NoteNode));
    default:
      return lines;
  }
}

function renderStandardNode(node: StandardNode): string[] {
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

function renderDecisionNode(node: DecisionNode): string[] {
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

function renderParallelNode(node: ParallelNode): string[] {
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

function renderLoopNode(node: LoopNode): string[] {
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

function renderSubflowNode(node: SubflowNode): string[] {
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

function renderNoteNode(node: NoteNode): string[] {
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

export function downloadMarkdown(workflow: Workflow): void {
  const markdown = exportToMarkdown(workflow);
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${workflow.title}.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
