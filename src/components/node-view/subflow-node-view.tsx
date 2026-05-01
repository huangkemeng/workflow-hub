'use client';

import { SubflowNode } from '@/types/node';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Workflow, ExternalLink, FolderTree } from 'lucide-react';

interface SubflowNodeViewProps {
  node: SubflowNode;
  isSelected?: boolean;
  onClick?: () => void;
}

export function SubflowNodeView({ node, isSelected, onClick }: SubflowNodeViewProps) {
  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Workflow className="h-5 w-5 text-primary" />
          <CardTitle className="text-base">{node.title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {/* 子流程类型 */}
        <Badge variant={node.data.subflowType === 'external' ? 'default' : 'secondary'}>
          {node.data.subflowType === 'external' ? (
            <>
              <ExternalLink className="h-3 w-3 mr-1" />
              外部工作流
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
          <div className="p-2 bg-muted rounded-md">
            <p className="text-xs text-muted-foreground mb-1">引用工作流</p>
            <p className="text-sm font-medium">{node.data.externalWorkflowId}</p>
          </div>
        )}

        {/* 内嵌节点数量 */}
        {node.data.subflowType === 'embedded' && node.data.embeddedNodes && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FolderTree className="h-4 w-4" />
            <span>{node.data.embeddedNodes.length} 个内嵌节点</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
