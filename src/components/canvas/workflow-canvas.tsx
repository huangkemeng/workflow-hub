'use client';

import { useRef, useState, useCallback } from 'react';
import { WorkflowNode } from '@/types/node';
import { Connection } from '@/types/connection';
import { StandardNodeView } from '@/components/node-view/standard-node-view';
import { DecisionNodeView } from '@/components/node-view/decision-node-view';
import { ParallelNodeView } from '@/components/node-view/parallel-node-view';
import { LoopNodeView } from '@/components/node-view/loop-node-view';
import { SubflowNodeView } from '@/components/node-view/subflow-node-view';
import { NoteNodeView } from '@/components/node-view/note-node-view';
import { ConnectionLine, ArrowMarker, TempConnectionLine, ConnectionTypeSelector } from './connection-line';
import { getOutgoingConnections, getNodeConnections, validateConnection } from '@/lib/connection-utils';
import { cn } from '@/lib/utils';
import { GitBranch, Plus } from 'lucide-react';

interface WorkflowCanvasProps {
  nodes: WorkflowNode[];
  connections: Connection[];
  selectedNodeId: string | null;
  selectedConnectionId: string | null;
  isCreatingConnection: boolean;
  tempConnection: { source: string; target: string | null } | null;
  onSelectNode: (nodeId: string) => void;
  onSelectConnection: (connectionId: string | null) => void;
  onStartConnection: (sourceNodeId: string) => void;
  onCompleteConnection: (type: 'sequential' | 'conditional' | 'loop' | 'parallel' | 'subflow', options?: { label?: string; condition?: string; color?: string }) => void;
  onCancelConnection: () => void;
  onDeleteConnection: (connectionId: string) => void;
  onUpdateConnection: (connectionId: string, updates: Partial<Connection>) => void;
}

export function WorkflowCanvas({
  nodes,
  connections,
  selectedNodeId,
  selectedConnectionId,
  isCreatingConnection,
  tempConnection,
  onSelectNode,
  onSelectConnection,
  onStartConnection,
  onCompleteConnection,
  onCancelConnection,
  onDeleteConnection,
  onUpdateConnection,
}: WorkflowCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [typeSelectorPosition, setTypeSelectorPosition] = useState({ x: 0, y: 0 });
  const [pendingTarget, setPendingTarget] = useState<string | null>(null);

  // 获取节点的位置（简化版，实际应该通过 ref 获取）
  const getNodePosition = useCallback((nodeId: string) => {
    const index = nodes.findIndex(n => n.id === nodeId);
    if (index === -1) return null;
    
    // 简化的位置计算
    return {
      x: 400, // 中心位置
      y: 100 + index * 200, // 每个节点间隔 200px
    };
  }, [nodes]);

  // 处理节点连接按钮点击
  const handleConnectClick = useCallback((nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isCreatingConnection && tempConnection?.source === nodeId) {
      // 取消连接
      onCancelConnection();
    } else if (isCreatingConnection && tempConnection) {
      // 完成连接
      const validation = validateConnection(
        tempConnection.source,
        nodeId,
        connections,
        nodes
      );
      
      if (validation.valid) {
        setPendingTarget(nodeId);
        setTypeSelectorPosition({ x: e.clientX, y: e.clientY });
        setShowTypeSelector(true);
      }
    } else {
      // 开始连接
      onStartConnection(nodeId);
    }
  }, [isCreatingConnection, tempConnection, connections, nodes, onStartConnection, onCancelConnection]);

  // 处理连接类型选择
  const handleTypeSelect = useCallback((type: 'sequential' | 'conditional' | 'loop' | 'parallel' | 'subflow') => {
    if (pendingTarget) {
      onCompleteConnection(type);
      setShowTypeSelector(false);
      setPendingTarget(null);
    }
  }, [pendingTarget, onCompleteConnection]);

  // 渲染节点
  const renderNode = (node: WorkflowNode, index: number) => {
    const isSelected = node.id === selectedNodeId;
    const isConnectionSource = tempConnection?.source === node.id;
    const nodeConnections = getNodeConnections(node.id, connections);
    const outgoingCount = nodeConnections.outgoing.length;

    const commonProps = {
      isSelected,
      onClick: () => {
        onSelectNode(node.id);
        onSelectConnection(null);
      },
    };

    return (
      <div key={node.id} className="relative" data-node-id={node.id}>
        {/* 节点 */}
        <div className="relative">
          {node.type === 'standard' && (
            <StandardNodeView node={node} {...commonProps} />
          )}
          {node.type === 'decision' && (
            <DecisionNodeView node={node} {...commonProps} />
          )}
          {node.type === 'parallel' && (
            <ParallelNodeView node={node} {...commonProps} />
          )}
          {node.type === 'loop' && (
            <LoopNodeView node={node} {...commonProps} />
          )}
          {node.type === 'subflow' && (
            <SubflowNodeView node={node} {...commonProps} />
          )}
          {node.type === 'note' && (
            <NoteNodeView node={node} {...commonProps} />
          )}

          {/* 连接按钮 */}
          <button
            onClick={(e) => handleConnectClick(node.id, e)}
            className={cn(
              'absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center transition-all z-10',
              isConnectionSource
                ? 'bg-primary text-primary-foreground scale-110'
                : 'bg-background border-2 border-border hover:border-primary hover:text-primary',
              isCreatingConnection && !isConnectionSource && 'animate-pulse'
            )}
            title={isConnectionSource ? '取消连接' : '创建连接'}
          >
            {isConnectionSource ? (
              <span className="text-xs">×</span>
            ) : (
              <Plus className="h-3 w-3" />
            )}
          </button>

          {/* 入连接指示器 */}
          {nodeConnections.incoming.length > 0 && (
            <div className="absolute -left-3 top-1/2 -translate-y-1/2">
              <div className="w-2 h-2 rounded-full bg-primary" />
            </div>
          )}
        </div>

        {/* 出连接信息 */}
        {outgoingCount > 0 && (
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1 text-xs text-muted-foreground">
            <GitBranch className="h-3 w-3" />
            <span>{outgoingCount} 个分支</span>
          </div>
        )}
      </div>
    );
  };

  // 渲染连接线
  const renderConnections = () => {
    return connections.map((connection) => {
      const sourceIndex = nodes.findIndex(n => n.id === connection.source);
      const targetIndex = nodes.findIndex(n => n.id === connection.target);
      
      if (sourceIndex === -1 || targetIndex === -1) return null;

      // 简化的位置计算
      const sourceX = 400;
      const sourceY = 100 + sourceIndex * 200 + 80; // 节点底部
      const targetX = 400;
      const targetY = 100 + targetIndex * 200; // 节点顶部

      return (
        <ConnectionLine
          key={connection.id}
          connection={connection}
          sourceX={sourceX}
          sourceY={sourceY}
          targetX={targetX}
          targetY={targetY}
          isSelected={selectedConnectionId === connection.id}
          onClick={() => {
            onSelectConnection(connection.id);
            onSelectNode('');
          }}
          onDelete={() => onDeleteConnection(connection.id)}
        />
      );
    });
  };

  return (
    <div
      ref={canvasRef}
      className="flex-1 overflow-y-auto p-8 bg-muted/10 relative"
      onClick={() => {
        onSelectNode('');
        onSelectConnection(null);
        if (isCreatingConnection) {
          onCancelConnection();
        }
      }}
    >
      {/* SVG 连接线层 */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
        <ArrowMarker />
        <g style={{ pointerEvents: 'all' }}>
          {renderConnections()}
        </g>
      </svg>

      {/* 节点层 */}
      <div className="max-w-2xl mx-auto space-y-16 relative" style={{ zIndex: 2 }}>
        {nodes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground min-h-[400px]">
            <p className="text-lg font-medium mb-2">画布为空</p>
            <p className="text-sm">从左侧选择节点类型添加到画布</p>
          </div>
        ) : (
          nodes.map((node, index) => renderNode(node, index))
        )}
      </div>

      {/* 连接类型选择器 */}
      {showTypeSelector && (
        <div
          className="fixed z-50"
          style={{ left: typeSelectorPosition.x, top: typeSelectorPosition.y }}
        >
          <ConnectionTypeSelector
            onSelect={handleTypeSelect}
            onCancel={() => {
              setShowTypeSelector(false);
              setPendingTarget(null);
            }}
          />
        </div>
      )}

      {/* 连接模式提示 */}
      {isCreatingConnection && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg z-50">
          选择目标节点完成连接，或点击空白处取消
        </div>
      )}
    </div>
  );
}
