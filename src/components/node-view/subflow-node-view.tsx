'use client';

import { SubflowNode } from '@/types/node';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GitBranch, ExternalLink, FolderTree, ArrowRightLeft, ArrowLeftRight } from 'lucide-react';

interface SubflowNodeViewProps {
  node: SubflowNode;
  isSelected?: boolean;
  onClick?: () => void;
}

export function SubflowNodeView({ node, isSelected, onClick }: SubflowNodeViewProps) {
  const { data } = node;
  const hasInputMappings = data.inputMappings && data.inputMappings.length > 0;
  const hasOutputMappings = data.outputMappings && data.outputMappings.length > 0;

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-primary" />
          <CardTitle className="text-base">{node.title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {/* 子流程引用信息 */}
        {data.subflowId ? (
          <div className="p-2 bg-muted rounded-md">
            <div className="flex items-center gap-2 mb-1">
              <ExternalLink className="h-3 w-3 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">引用工作流</p>
            </div>
            <p className="text-sm font-medium truncate">{data.subflowTitle || data.subflowId}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                {data.version || 'latest'}
              </Badge>
            </div>
          </div>
        ) : (
          <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-xs text-yellow-700">未选择子流程</p>
          </div>
        )}

        {/* 映射配置摘要 */}
        <div className="flex items-center gap-2">
          {hasInputMappings && (
            <Badge variant="secondary" className="text-xs">
              <ArrowRightLeft className="h-3 w-3 mr-1" />
              输入: {data.inputMappings!.length}
            </Badge>
          )}
          {hasOutputMappings && (
            <Badge variant="secondary" className="text-xs">
              <ArrowLeftRight className="h-3 w-3 mr-1" />
              输出: {data.outputMappings!.length}
            </Badge>
          )}
          {!hasInputMappings && !hasOutputMappings && (
            <span className="text-xs text-muted-foreground">无参数映射</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
