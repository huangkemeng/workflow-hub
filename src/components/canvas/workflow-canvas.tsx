'use client';

import { WorkflowNode } from '@/types/node';
import { StandardNodeView } from '@/components/node-view/standard-node-view';
import { DecisionNodeView } from '@/components/node-view/decision-node-view';
import { ParallelNodeView } from '@/components/node-view/parallel-node-view';
import { LoopNodeView } from '@/components/node-view/loop-node-view';
import { SubflowNodeView } from '@/components/node-view/subflow-node-view';
import { NoteNodeView } from '@/components/node-view/note-node-view';
import { ArrowDown } from 'lucide-react';

interface WorkflowCanvasProps {
  nodes: WorkflowNode[];
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
}

export function WorkflowCanvas({ nodes, selectedNodeId, onSelectNode }: WorkflowCanvasProps) {
  const renderNode = (node: WorkflowNode, index: number) => {
    const isSelected = node.id === selectedNodeId;
    const onClick = () => onSelectNode(node.id);

    return (
      <div key={node.id} className="relative">
        {/* 连接线 */}
        {index > 0 && (
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex flex-col items-center text-muted-foreground">
            <ArrowDown className="h-4 w-4" />
          </div>
        )}

        {/* 节点 */}
        <div className="mt-4">
          {node.type === 'standard' && (
            <StandardNodeView
              node={node}
              isSelected={isSelected}
              onClick={onClick}
            />
          )}
          {node.type === 'decision' && (
            <DecisionNodeView
              node={node}
              isSelected={isSelected}
              onClick={onClick}
            />
          )}
          {node.type === 'parallel' && (
            <ParallelNodeView
              node={node}
              isSelected={isSelected}
              onClick={onClick}
            />
          )}
          {node.type === 'loop' && (
            <LoopNodeView
              node={node}
              isSelected={isSelected}
              onClick={onClick}
            />
          )}
          {node.type === 'subflow' && (
            <SubflowNodeView
              node={node}
              isSelected={isSelected}
              onClick={onClick}
            />
          )}
          {node.type === 'note' && (
            <NoteNodeView
              node={node}
              isSelected={isSelected}
              onClick={onClick}
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto p-8">
      {nodes.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
          <p className="text-lg font-medium mb-2">画布为空</p>
          <p className="text-sm">从左侧选择节点类型添加到画布</p>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto space-y-2">
          {nodes.map((node, index) => renderNode(node, index))}
        </div>
      )}
    </div>
  );
}
