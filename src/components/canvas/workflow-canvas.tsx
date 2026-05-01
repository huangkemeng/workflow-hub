'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { WorkflowNode } from '@/types/node';
import { Connection } from '@/types/connection';
import { StandardNodeView } from '@/components/node-view/standard-node-view';
import { DecisionNodeView } from '@/components/node-view/decision-node-view';
import { ParallelNodeView } from '@/components/node-view/parallel-node-view';
import { LoopNodeView } from '@/components/node-view/loop-node-view';
import { SubflowNodeView } from '@/components/node-view/subflow-node-view';
import { NoteNodeView } from '@/components/node-view/note-node-view';
import { SortableNode } from './sortable-node';
import { ConnectionLine, ArrowMarker, ConnectionTypeSelector } from './connection-line';
import { getNodeConnections, validateConnection } from '@/lib/connection-utils';
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
  onReorderNodes: (nodes: WorkflowNode[]) => void;
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
  onReorderNodes,
}: WorkflowCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const nodesRef = useRef(nodes);
  const connectionsRef = useRef(connections);
  const isCreatingRef = useRef(isCreatingConnection);
  const tempConnectionRef = useRef(tempConnection);
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [typeSelectorPosition, setTypeSelectorPosition] = useState({ x: 0, y: 0 });
  const [pendingTarget, setPendingTarget] = useState<string | null>(null);

  // 保持引用最新
  useEffect(() => {
    nodesRef.current = nodes;
    connectionsRef.current = connections;
    isCreatingRef.current = isCreatingConnection;
    tempConnectionRef.current = tempConnection;
  }, [nodes, connections, isCreatingConnection, tempConnection]);

  // 配置拖拽传感器 - 使用 MouseSensor 和 TouchSensor 替代 PointerSensor
  // 确保点击事件能正常传播到节点
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8, // 需要移动 8px 才开始拖拽
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200, // 触摸延迟 200ms，避免误触
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 处理拖拽结束
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const currentNodes = nodesRef.current;
      const oldIndex = currentNodes.findIndex((n) => n.id === active.id);
      const newIndex = currentNodes.findIndex((n) => n.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedNodes = arrayMove(currentNodes, oldIndex, newIndex).map((node, index) => ({
          ...node,
          position: index + 1,
        }));

        onReorderNodes(reorderedNodes);
      }
    }
  }, [onReorderNodes]);

  // 处理节点连接按钮点击 - 使用 ref 获取最新状态避免闭包问题
  const handleConnectClick = useCallback((nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    const currentIsCreating = isCreatingRef.current;
    const currentTempConnection = tempConnectionRef.current;
    const currentConnections = connectionsRef.current;
    const currentNodes = nodesRef.current;

    if (currentIsCreating && currentTempConnection?.source === nodeId) {
      // 取消连接
      onCancelConnection();
    } else if (currentIsCreating && currentTempConnection) {
      // 完成连接
      const validation = validateConnection(
        currentTempConnection.source,
        nodeId,
        currentConnections,
        currentNodes
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
  }, [onStartConnection, onCancelConnection]);

  // 处理连接类型选择
  const handleTypeSelect = useCallback((type: 'sequential' | 'conditional' | 'loop' | 'parallel' | 'subflow') => {
    if (pendingTarget) {
      onCompleteConnection(type);
      setShowTypeSelector(false);
      setPendingTarget(null);
    }
  }, [pendingTarget, onCompleteConnection]);

  // 渲染单个节点
  const renderNodeContent = (node: WorkflowNode) => {
    const isSelected = node.id === selectedNodeId;
    const isConnectionSource = tempConnection?.source === node.id;
    const nodeConnections = getNodeConnections(node.id, connections);
    const outgoingCount = nodeConnections.outgoing.length;

    const commonProps = {
      isSelected,
      onClick: (e: React.MouseEvent) => {
        e.stopPropagation(); // 阻止事件冒泡到画布
        onSelectNode(node.id);
        onSelectConnection(null);
      },
    };

    return (
      <div className="relative">
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

      {/* 节点层 - 带拖拽排序 */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={nodes.map(n => n.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="max-w-2xl mx-auto space-y-16 relative" style={{ zIndex: 2 }}>
            {nodes.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground min-h-[400px]">
                <p className="text-lg font-medium mb-2">画布为空</p>
                <p className="text-sm">从左侧选择节点类型添加到画布</p>
              </div>
            ) : (
              nodes.map((node) => (
                <SortableNode
                  key={node.id}
                  id={node.id}
                  isSelected={node.id === selectedNodeId}
                  isDisabled={isCreatingConnection}
                >
                  {renderNodeContent(node)}
                </SortableNode>
              ))
            )}
          </div>
        </SortableContext>
      </DndContext>

      {/* 连接类型选择器 */}
      {showTypeSelector && (
        <div
          className="fixed z-50"
          style={{
            left: typeSelectorPosition.x,
            top: typeSelectorPosition.y,
          }}
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
    </div>
  );
}
