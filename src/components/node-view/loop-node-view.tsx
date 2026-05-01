'use client';

import { LoopNode } from '@/types/node';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, RotateCcw, History, CheckCircle2, XCircle, HelpCircle } from 'lucide-react';

interface LoopNodeViewProps {
  node: LoopNode;
  isSelected?: boolean;
  onClick?: () => void;
}

export function LoopNodeView({ node, isSelected, onClick }: LoopNodeViewProps) {
  const iterationCount = node.data.iterations?.length || 0;
  const passedCount = node.data.iterations?.filter(i => i.passed === true).length || 0;
  const failedCount = node.data.iterations?.filter(i => i.passed === false).length || 0;
  const pendingCount = node.data.iterations?.filter(i => i.passed === undefined).length || 0;

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">{node.title}</CardTitle>
          </div>
          <Badge variant="outline">
            <RotateCcw className="h-3 w-3 mr-1" />
            {iterationCount} 次迭代
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {/* 循环类型 */}
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {node.data.loopType === 'fixed' ? '固定次数' : '条件循环'}
          </Badge>
          {node.data.loopType === 'fixed' && node.data.maxIterations && (
            <span className="text-sm text-muted-foreground">
              最多 {node.data.maxIterations} 次
            </span>
          )}
        </div>

        {/* 退出条件 */}
        {node.data.loopType === 'conditional' && node.data.exitCondition && (
          <div className="p-2 bg-muted rounded-md">
            <p className="text-xs text-muted-foreground mb-1">退出条件</p>
            <p className="text-sm">{node.data.exitCondition}</p>
          </div>
        )}

        {/* 迭代统计 */}
        {iterationCount > 0 && (
          <div className="flex items-center gap-2 text-xs">
            {passedCount > 0 && (
              <span className="flex items-center gap-1 text-green-600">
                <CheckCircle2 className="h-3 w-3" />
                {passedCount} 通过
              </span>
            )}
            {failedCount > 0 && (
              <span className="flex items-center gap-1 text-red-600">
                <XCircle className="h-3 w-3" />
                {failedCount} 未通过
              </span>
            )}
            {pendingCount > 0 && (
              <span className="flex items-center gap-1 text-yellow-600">
                <HelpCircle className="h-3 w-3" />
                {pendingCount} 待评估
              </span>
            )}
          </div>
        )}

        {/* 迭代历史 */}
        {node.data.iterations && node.data.iterations.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-medium">迭代历史</p>
            <div className="space-y-1 max-h-24 overflow-y-auto">
              {node.data.iterations.slice(-3).map((iteration) => (
                <div
                  key={iteration.id}
                  className="flex items-center gap-2 p-1.5 rounded bg-muted/50 text-sm"
                >
                  {iteration.passed === true ? (
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                  ) : iteration.passed === false ? (
                    <XCircle className="h-3 w-3 text-red-500" />
                  ) : (
                    <History className="h-3 w-3 text-muted-foreground" />
                  )}
                  <span className="font-medium">第 {iteration.iteration} 轮</span>
                  {iteration.result && (
                    <span className="text-muted-foreground truncate flex-1">
                      {iteration.result}
                    </span>
                  )}
                </div>
              ))}
              {node.data.iterations.length > 3 && (
                <p className="text-xs text-muted-foreground text-center">
                  还有 {node.data.iterations.length - 3} 条记录...
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
