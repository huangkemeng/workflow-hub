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
        data: {},
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

// 节点类型切换时的数据迁移
export function migrateNodeData(
  sourceNode: WorkflowNode,
  targetType: NodeType
): Partial<WorkflowNode> {
  const baseData = {
    title: sourceNode.title,
    position: sourceNode.position,
    config: sourceNode.config,
  };

  // 创建新节点以获取默认数据结构
  const newNode = createNode(targetType, sourceNode.position);

  // 根据源类型和目标类型进行数据迁移
  switch (targetType) {
    case 'standard':
      return {
        ...baseData,
        type: 'standard',
        data: migrateToStandardData(sourceNode),
      } as StandardNode;

    case 'decision':
      return {
        ...baseData,
        type: 'decision',
        data: migrateToDecisionData(sourceNode),
      } as DecisionNode;

    case 'parallel':
      return {
        ...baseData,
        type: 'parallel',
        data: newNode.data,
      } as ParallelNode;

    case 'loop':
      return {
        ...baseData,
        type: 'loop',
        data: newNode.data,
      } as LoopNode;

    case 'subflow':
      return {
        ...baseData,
        type: 'subflow',
        data: newNode.data,
      } as SubflowNode;

    case 'note':
      return {
        ...baseData,
        type: 'note',
        data: migrateToNoteData(sourceNode),
      } as NoteNode;

    default:
      return newNode;
  }
}

// 迁移到标准节点数据
function migrateToStandardData(sourceNode: WorkflowNode): StandardNode['data'] {
  const baseData = {
    characters: [],
    tags: [],
    status: 'pending' as const,
    event: {
      content: '',
      format: 'rich-text' as const,
    },
  };

  switch (sourceNode.type) {
    case 'note':
      return {
        ...baseData,
        event: {
          content: sourceNode.data.content || '',
          format: 'rich-text',
        },
      };

    case 'decision':
      return {
        ...baseData,
        event: {
          content: `判断条件: ${sourceNode.data.condition || ''}`,
          format: 'rich-text',
        },
      };

    default:
      return baseData;
  }
}

// 迁移到判断节点数据
function migrateToDecisionData(sourceNode: WorkflowNode): DecisionNode['data'] {
  const baseData = {
    condition: '',
    decisionType: 'binary' as const,
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
  };

  switch (sourceNode.type) {
    case 'standard':
      return {
        ...baseData,
        condition: sourceNode.data.event?.content || '',
      };

    default:
      return baseData;
  }
}

// 迁移到备注节点数据
function migrateToNoteData(sourceNode: WorkflowNode): NoteNode['data'] {
  const baseData = {
    noteType: 'info' as const,
    content: '',
    isCollapsible: false,
    defaultCollapsed: false,
  };

  switch (sourceNode.type) {
    case 'standard':
      return {
        ...baseData,
        content: sourceNode.data.event?.content || '',
      };

    case 'decision':
      return {
        ...baseData,
        noteType: 'warning',
        content: `原判断节点，条件: ${sourceNode.data.condition || ''}`,
      };

    default:
      return baseData;
  }
}

// 切换节点类型
export function switchNodeType(
  nodes: WorkflowNode[],
  nodeId: string,
  newType: NodeType
): WorkflowNode[] {
  const nodeIndex = nodes.findIndex((n) => n.id === nodeId);
  if (nodeIndex === -1) return nodes;

  const sourceNode = nodes[nodeIndex];
  const migratedNode = migrateNodeData(sourceNode, newType);

  const newNodes = [...nodes];
  newNodes[nodeIndex] = {
    ...sourceNode,
    ...migratedNode,
    id: sourceNode.id, // 保持ID不变
  } as WorkflowNode;

  return newNodes;
}
