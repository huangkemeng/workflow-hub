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

export interface Attachment {
  name: string;
  url: string;
  type: string;
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

// 判断节点
export interface Branch {
  id: string;
  label: string;
  condition?: string;
  color?: string;
  nextNodeId?: string;
  description?: string;
}

export interface DecisionNode extends BaseNode {
  type: 'decision';
  data: {
    condition: string;
    decisionType: 'binary' | 'multiple';
    branches: Branch[];
    defaultBranch?: string;
  };
}

// 并行节点
export interface ParallelTask {
  id: string;
  title: string;
  assignee?: string;
  status?: 'pending' | 'in-progress' | 'completed';
  priority?: 'low' | 'medium' | 'high';
  estimatedHours?: number;
  dependencies?: string[];
}

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

// 循环节点
export interface LoopIteration {
  id: string;
  iteration: number;
  result?: string;
  feedback?: string;
  completedAt?: string;
}

export interface LoopNode extends BaseNode {
  type: 'loop';
  data: {
    loopType: 'fixed' | 'conditional';
    maxIterations?: number;
    exitCondition?: string;
    iterations?: LoopIteration[];
  };
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
