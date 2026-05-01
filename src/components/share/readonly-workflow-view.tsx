'use client';

import { Workflow } from '@/types/workflow';
import { WorkflowNode } from '@/types/node';
import { ReadonlyStandardNode } from '@/components/readonly/readonly-standard-node';
import { ReadonlyDecisionNode } from '@/components/readonly/readonly-decision-node';
import { ReadonlyParallelNode } from '@/components/readonly/readonly-parallel-node';
import { ReadonlyLoopNode } from '@/components/readonly/readonly-loop-node';
import { ReadonlySubflowNode } from '@/components/readonly/readonly-subflow-node';
import { ReadonlyNoteNode } from '@/components/readonly/readonly-note-node';
import { ArrowDown } from 'lucide-react';

interface ReadonlyWorkflowViewProps {
  workflow: Workflow;
}

export function ReadonlyWorkflowView({ workflow }: ReadonlyWorkflowViewProps) {
  const renderNode = (node: WorkflowNode, index: number) => {
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
            <ReadonlyStandardNode node={node as any} stepNumber={index + 1} />
          )}
          {node.type === 'decision' && (
            <ReadonlyDecisionNode node={node as any} stepNumber={index + 1} />
          )}
          {node.type === 'parallel' && (
            <ReadonlyParallelNode node={node as any} stepNumber={index + 1} />
          )}
          {node.type === 'loop' && (
            <ReadonlyLoopNode node={node as any} stepNumber={index + 1} />
          )}
          {node.type === 'subflow' && (
            <ReadonlySubflowNode node={node as any} stepNumber={index + 1} />
          )}
          {node.type === 'note' && (
            <ReadonlyNoteNode node={node as any} stepNumber={index + 1} />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto space-y-2">
      {workflow.nodes?.map((node, index) => renderNode(node, index))}
    </div>
  );
}
