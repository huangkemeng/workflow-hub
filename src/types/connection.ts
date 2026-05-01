// 连接类型定义
export type ConnectionType = 'sequential' | 'conditional' | 'loop' | 'parallel' | 'subflow';

// 连接数据结构
export interface Connection {
  id: string;
  source: string; // 源节点ID
  target: string; // 目标节点ID
  type: ConnectionType;
  label?: string; // 连接标签
  condition?: string; // 条件描述（用于条件连接）
  style?: {
    color?: string;
    lineStyle?: 'solid' | 'dashed' | 'dotted';
    arrowType?: 'arrow' | 'none';
  };
  metadata?: {
    createdAt: string;
    description?: string;
  };
}

// 连接创建请求
export interface CreateConnectionRequest {
  source: string;
  target: string;
  type: ConnectionType;
  label?: string;
  condition?: string;
  style?: Connection['style'];
}

// 连接更新请求
export interface UpdateConnectionRequest {
  label?: string;
  condition?: string;
  style?: Connection['style'];
}

// 节点连接信息（用于前端展示）
export interface NodeConnectionInfo {
  incoming: Connection[];
  outgoing: Connection[];
}

// 连接验证结果
export interface ConnectionValidationResult {
  valid: boolean;
  error?: string;
  wouldCreateCycle?: boolean;
}

// 流程路径
export interface FlowPath {
  nodes: string[];
  connections: string[];
}
