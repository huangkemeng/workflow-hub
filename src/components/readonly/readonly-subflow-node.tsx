'use client';

import { SubflowNode } from '@/types/node';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GitBranch, ExternalLink, ArrowRightLeft, ArrowLeftRight } from 'lucide-react';

interface ReadonlySubflowNodeProps {
  node: SubflowNode;
  stepNumber: number;
}

export function ReadonlySubflowNode({ node, stepNumber }: ReadonlySubflowNodeProps) {
  const { data } = node;
  const hasInputMappings = data.inputMappings && data.inputMappings.length > 0;
  const hasOutputMappings = data.outputMappings && data.outputMappings.length > 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground mb-1">步骤 {stepNumber}</p>
            <CardTitle>{node.title}</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 子流程引用信息 */}
        {data.subflowId ? (
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium">引用工作流</p>
            </div>
            <p className="text-sm">{data.subflowTitle || data.subflowId}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-xs">
                版本: {data.version || 'latest'}
              </Badge>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-700">未配置子流程</p>
          </div>
        )}

        {/* 参数映射 */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">参数映射</h4>
          <div className="flex items-center gap-2">
            {hasInputMappings && (
              <Badge variant="secondary" className="text-xs">
                <ArrowRightLeft className="h-3 w-3 mr-1" />
                输入: {data.inputMappings!.length} 个
              </Badge>
            )}
            {hasOutputMappings && (
              <Badge variant="secondary" className="text-xs">
                <ArrowLeftRight className="h-3 w-3 mr-1" />
                输出: {data.outputMappings!.length} 个
              </Badge>
            )}
            {!hasInputMappings && !hasOutputMappings && (
              <span className="text-sm text-muted-foreground">无参数映射配置</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
