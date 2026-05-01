import { WorkflowNode, NodeType, StandardNode, DecisionNode, ParallelNode, LoopNode, SubflowNode, NoteNode } from '@/types/node';

export function createNode(type: NodeType, position: number): WorkflowNode {
  const baseNode = {
    id: `node-${Date.now()}`,
    type,
    title: getDefaultTitle(type),
    position,
    config: {
      showInTimeline: true,
    },
  };

  switch (type) {
    case 'standard':
      return {
        ...baseNode,
        type: 'standard',
        data: {
          characters: [],
          tags: [],
          status: 'pending',
          event: {
            content: '',
            format: 'rich-text',
          },
        },
      } as StandardNode;

    case 'decision':
      return {
        ...baseNode,
        type: 'decision',
        data: {
          condition: '',
          decisionType: 'binary',
          branches: [
            {
              id: `branch-${Date.now()}-1`,
              label: '是',
              color: '#52c41a',
            },
            {
              id: `branch-${Date.now()}-2`,
              label: '否',
              color: '#f5222d',
            },
          ],
        },
      } as DecisionNode;

    case 'parallel':
      return {
        ...baseNode,
        type: 'parallel',
        data: {
          tasks: [],
          completionCondition: 'all',
          syncPoint: {
            enabled: false,
          },
        },
      } as ParallelNode;

    case 'loop':
      return {
        ...baseNode,
        type: 'loop',
        data: {
          loopType: 'conditional',
          iterations: [],
        },
      } as LoopNode;

    case 'subflow':
      return {
        ...baseNode,
        type: 'subflow',
        data: {
          subflowType: 'embedded',
        },
      } as SubflowNode;

    case 'note':
      return {
        ...baseNode,
        type: 'note',
        data: {
          noteType: 'info',
          content: '',
          isCollapsible: false,
          defaultCollapsed: false,
        },
      } as NoteNode;

    default:
      throw new Error(`Unknown node type: ${type}`);
  }
}

export function getDefaultTitle(type: NodeType): string {
  const titles: Record<NodeType, string> = {
    standard: '标准节点',
    decision: '判断节点',
    parallel: '并行节点',
    loop: '循环节点',
    subflow: '子流程节点',
    note: '备注节点',
  };
  return titles[type];
}

export function getNodeTypeLabel(type: NodeType): string {
  const labels: Record<NodeType, string> = {
    standard: '标准节点',
    decision: '判断节点',
    parallel: '并行节点',
    loop: '循环节点',
    subflow: '子流程节点',
    note: '备注节点',
  };
  return labels[type];
}

export function getNodeTypeDescription(type: NodeType): string {
  const descriptions: Record<NodeType, string> = {
    standard: '记录事件、人物、时间和地点信息',
    decision: '根据条件进行分支判断',
    parallel: '同时执行多个任务',
    loop: '重复执行直到满足条件',
    subflow: '引用其他工作流作为子流程',
    note: '添加备注和说明信息',
  };
  return descriptions[type];
}

export function getNodeTypeIcon(type: NodeType): string {
  const icons: Record<NodeType, string> = {
    standard: 'FileText',
    decision: 'GitBranch',
    parallel: 'Layers',
    loop: 'RefreshCw',
    subflow: 'Workflow',
    note: 'StickyNote',
  };
  return icons[type];
}

export function reorderNodes(nodes: WorkflowNode[], fromIndex: number, toIndex: number): WorkflowNode[] {
  const result = [...nodes];
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);
  
  // 更新 position
  return result.map((node, index) => ({
    ...node,
    position: index + 1,
  }));
}

export function sortNodesByPosition(nodes: WorkflowNode[]): WorkflowNode[] {
  return [...nodes].sort((a, b) => a.position - b.position);
}
