import { Connection, ConnectionType, ConnectionValidationResult, FlowPath } from '@/types/connection';
import { WorkflowNode } from '@/types/node';

// 创建连接
export function createConnection(
  sourceId: string,
  targetId: string,
  type: ConnectionType = 'sequential',
  options?: {
    label?: string;
    condition?: string;
    color?: string;
  }
): Connection {
  return {
    id: `conn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    source: sourceId,
    target: targetId,
    type,
    label: options?.label,
    condition: options?.condition,
    style: {
      color: options?.color || getDefaultColor(type),
      lineStyle: getDefaultLineStyle(type),
      arrowType: 'arrow',
    },
    metadata: {
      createdAt: new Date().toISOString(),
    },
  };
}

// 获取默认颜色
function getDefaultColor(type: ConnectionType): string {
  const colors: Record<ConnectionType, string> = {
    sequential: '#6b7280',
    conditional: '#3b82f6',
    loop: '#f59e0b',
    parallel: '#10b981',
    subflow: '#8b5cf6',
  };
  return colors[type];
}

// 获取默认线型
function getDefaultLineStyle(type: ConnectionType): 'solid' | 'dashed' | 'dotted' {
  const styles: Record<ConnectionType, 'solid' | 'dashed' | 'dotted'> = {
    sequential: 'solid',
    conditional: 'solid',
    loop: 'dashed',
    parallel: 'solid',
    subflow: 'dotted',
  };
  return styles[type];
}

// 验证连接是否合法
export function validateConnection(
  sourceId: string,
  targetId: string,
  connections: Connection[],
  nodes: WorkflowNode[]
): ConnectionValidationResult {
  // 检查源节点和目标节点是否存在
  const sourceExists = nodes.some(n => n.id === sourceId);
  const targetExists = nodes.some(n => n.id === targetId);

  if (!sourceExists) {
    return { valid: false, error: '源节点不存在' };
  }
  if (!targetExists) {
    return { valid: false, error: '目标节点不存在' };
  }

  // 检查是否自连接
  if (sourceId === targetId) {
    return { valid: false, error: '不能连接到自己' };
  }

  // 检查连接是否已存在
  const exists = connections.some(
    c => c.source === sourceId && c.target === targetId
  );
  if (exists) {
    return { valid: false, error: '连接已存在' };
  }

  // 检查是否会形成循环
  const wouldCreateCycle = detectCycle(sourceId, targetId, connections);
  if (wouldCreateCycle) {
    return { valid: false, error: '不能形成循环连接', wouldCreateCycle: true };
  }

  return { valid: true };
}

// 检测是否形成循环
function detectCycle(
  sourceId: string,
  targetId: string,
  existingConnections: Connection[]
): boolean {
  // 创建临时的连接列表
  const tempConnections = [
    ...existingConnections,
    { source: sourceId, target: targetId } as Connection,
  ];

  // 使用DFS检测循环
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function hasCycle(nodeId: string): boolean {
    visited.add(nodeId);
    recursionStack.add(nodeId);

    // 找到从当前节点出发的所有连接
    const outgoingConnections = tempConnections.filter(c => c.source === nodeId);

    for (const conn of outgoingConnections) {
      if (!visited.has(conn.target)) {
        if (hasCycle(conn.target)) {
          return true;
        }
      } else if (recursionStack.has(conn.target)) {
        return true;
      }
    }

    recursionStack.delete(nodeId);
    return false;
  }

  // 从源节点开始检测
  return hasCycle(sourceId);
}

// 获取节点的入连接
export function getIncomingConnections(
  nodeId: string,
  connections: Connection[]
): Connection[] {
  return connections.filter(c => c.target === nodeId);
}

// 获取节点的出连接
export function getOutgoingConnections(
  nodeId: string,
  connections: Connection[]
): Connection[] {
  return connections.filter(c => c.source === nodeId);
}

// 获取节点的所有连接
export function getNodeConnections(
  nodeId: string,
  connections: Connection[]
): { incoming: Connection[]; outgoing: Connection[] } {
  return {
    incoming: getIncomingConnections(nodeId, connections),
    outgoing: getOutgoingConnections(nodeId, connections),
  };
}

// 删除与节点相关的所有连接
export function removeNodeConnections(
  nodeId: string,
  connections: Connection[]
): Connection[] {
  return connections.filter(c => c.source !== nodeId && c.target !== nodeId);
}

// 更新连接
export function updateConnection(
  connectionId: string,
  updates: Partial<Connection>,
  connections: Connection[]
): Connection[] {
  return connections.map(c =>
    c.id === connectionId ? { ...c, ...updates } : c
  );
}

// 删除连接
export function deleteConnection(
  connectionId: string,
  connections: Connection[]
): Connection[] {
  return connections.filter(c => c.id !== connectionId);
}

// 获取连接类型标签
export function getConnectionTypeLabel(type: ConnectionType): string {
  const labels: Record<ConnectionType, string> = {
    sequential: '顺序连接',
    conditional: '条件连接',
    loop: '循环连接',
    parallel: '并行连接',
    subflow: '子流程连接',
  };
  return labels[type];
}

// 获取连接类型描述
export function getConnectionTypeDescription(type: ConnectionType): string {
  const descriptions: Record<ConnectionType, string> = {
    sequential: '默认的流程执行顺序',
    conditional: '根据条件判断的分支连接',
    loop: '返回循环节点的连接',
    parallel: '并行任务之间的连接',
    subflow: '子流程的输入输出连接',
  };
  return descriptions[type];
}

// 查找从起始节点到目标节点的所有路径
export function findAllPaths(
  startNodeId: string,
  endNodeId: string,
  connections: Connection[]
): FlowPath[] {
  const paths: FlowPath[] = [];
  const visited = new Set<string>();

  function dfs(
    currentNodeId: string,
    targetNodeId: string,
    currentVisited: Set<string>,
    currentPath: string[],
    currentConnections: string[]
  ) {
    if (currentNodeId === targetNodeId) {
      paths.push({
        nodes: [...currentPath],
        connections: [...currentConnections],
      });
      return;
    }

    const outgoingConnections = connections.filter(c => c.source === currentNodeId);

    for (const conn of outgoingConnections) {
      if (!currentVisited.has(conn.target)) {
        currentVisited.add(conn.target);
        dfs(
          conn.target,
          targetNodeId,
          currentVisited,
          [...currentPath, conn.target],
          [...currentConnections, conn.id]
        );
        currentVisited.delete(conn.target);
      }
    }
  }

  visited.add(startNodeId);
  dfs(startNodeId, endNodeId, visited, [startNodeId], []);

  return paths;
}

// 获取流程的拓扑排序
export function topologicalSort(
  nodes: WorkflowNode[],
  connections: Connection[]
): WorkflowNode[] {
  const inDegree = new Map<string, number>();
  const adjacencyList = new Map<string, string[]>();

  // 初始化
  nodes.forEach(node => {
    inDegree.set(node.id, 0);
    adjacencyList.set(node.id, []);
  });

  // 构建邻接表和入度
  connections.forEach(conn => {
    const neighbors = adjacencyList.get(conn.source) || [];
    neighbors.push(conn.target);
    adjacencyList.set(conn.source, neighbors);

    inDegree.set(conn.target, (inDegree.get(conn.target) || 0) + 1);
  });

  // 找到所有入度为0的节点
  const queue: string[] = [];
  nodes.forEach(node => {
    if ((inDegree.get(node.id) || 0) === 0) {
      queue.push(node.id);
    }
  });

  const result: WorkflowNode[] = [];
  const nodeMap = new Map(nodes.map(n => [n.id, n]));

  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    const node = nodeMap.get(nodeId);
    if (node) {
      result.push(node);
    }

    const neighbors = adjacencyList.get(nodeId) || [];
    for (const neighborId of neighbors) {
      const newInDegree = (inDegree.get(neighborId) || 0) - 1;
      inDegree.set(neighborId, newInDegree);

      if (newInDegree === 0) {
        queue.push(neighborId);
      }
    }
  }

  return result;
}

// 检查节点是否可以作为连接的源节点
export function canBeSource(node: WorkflowNode): boolean {
  // 所有节点类型都可以作为源节点
  return true;
}

// 检查节点是否可以作为连接的目标节点
export function canBeTarget(node: WorkflowNode): boolean {
  // 所有节点类型都可以作为目标节点
  return true;
}

// 获取判断节点的分支连接
export function getDecisionBranches(
  decisionNodeId: string,
  connections: Connection[]
): Connection[] {
  return connections.filter(
    c => c.source === decisionNodeId && c.type === 'conditional'
  );
}

// 创建判断节点的分支连接
export function createBranchConnection(
  decisionNodeId: string,
  targetNodeId: string,
  branchLabel: string,
  condition?: string,
  color?: string
): Connection {
  return createConnection(decisionNodeId, targetNodeId, 'conditional', {
    label: branchLabel,
    condition,
    color: color || '#3b82f6',
  });
}
