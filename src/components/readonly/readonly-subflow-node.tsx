'use client';

import { SubflowNode } from '@/types/node';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Workflow, ExternalLink, FolderTree } from 'lucide-react';

interface ReadonlySubflowNodeProps {
  node: SubflowNode;
  stepNumber: number;
}

export function ReadonlySubflowNode({ node, stepNumber }: ReadonlySubflowNodeProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Workflow className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground mb-1">步骤 {stepNumber}</p>
            <CardTitle>{node.title}</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 子流程类型 */}
        <Badge variant={node.data.subflowType === 'external' ? 'default' : 'secondary'}>
          {node.data.subflowType === 'external' ? (
            <>
              <ExternalLink className="h-3 w-3 mr-1" />
              外部工作流引用
            </>
          ) : (
            <>
              <FolderTree className="h-3 w-3 mr-1" />
              内嵌子流程
            </>
          )}
        </Badge>

        {/* 外部工作流引用 */}
        {node.data.subflowType === 'external' && node.data.externalWorkflowId && (
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-2">引用工作流</p>
            <p className="text-muted-foreground">{node.data.externalWorkflowId}</p>
          </div>
        )}

        {/* 内嵌节点数量 */}
        {node.data.subflowType === 'embedded' && node.data.embeddedNodes && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FolderTree className="h-4 w-4" />
            <span>包含 {node.data.embeddedNodes.length} 个内嵌节点</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
