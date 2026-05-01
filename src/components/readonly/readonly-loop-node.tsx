'use client';

import { LoopNode } from '@/types/node';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, History } from 'lucide-react';

interface ReadonlyLoopNodeProps {
  node: LoopNode;
  stepNumber: number;
}

export function ReadonlyLoopNode({ node, stepNumber }: ReadonlyLoopNodeProps) {
  const iterationCount = node.data.iterations?.length || 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground mb-1">步骤 {stepNumber}</p>
              <CardTitle>{node.title}</CardTitle>
            </div>
          </div>
          <Badge variant="outline">
            <History className="h-3 w-3 mr-1" />
            {iterationCount} 次迭代
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 循环类型 */}
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {node.data.loopType === 'fixed' ? '固定次数循环' : '条件循环'}
          </Badge>
          {node.data.maxIterations && (
            <span className="text-sm text-muted-foreground">
              最多 {node.data.maxIterations} 次
            </span>
          )}
        </div>

        {/* 退出条件 */}
        {node.data.loopType === 'conditional' && node.data.exitCondition && (
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-2">退出条件</p>
            <p className="text-muted-foreground">{node.data.exitCondition}</p>
          </div>
        )}

        {/* 迭代历史 */}
        {node.data.iterations && node.data.iterations.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-medium">迭代历史</p>
            <div className="space-y-2">
              {node.data.iterations.map((iteration) => (
                <div
                  key={iteration.id}
                  className="flex items-start gap-3 p-3 rounded-lg border"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium">
                    {iteration.iteration}
                  </div>
                  <div className="flex-1">
                    {iteration.result && (
                      <p className="text-sm">{iteration.result}</p>
                    )}
                    {iteration.feedback && (
                      <p className="text-sm text-muted-foreground mt-1">
                        反馈: {iteration.feedback}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
