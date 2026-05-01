'use client';

import { useState, useEffect } from 'react';
import { useWorkflows } from '@/hooks/use-workflows';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, GitBranch, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SubflowSelectorProps {
  currentWorkflowId: string;
  selectedWorkflowId?: string;
  onSelect: (workflowId: string, workflowTitle: string) => void;
}

export function SubflowSelector({
  currentWorkflowId,
  selectedWorkflowId,
  onSelect,
}: SubflowSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { workflows, isLoading } = useWorkflows({
    search: searchQuery,
    status: 'PUBLISHED', // 只显示已发布的工作流
  });

  // 过滤掉当前工作流（防止循环引用）
  const availableWorkflows = workflows.filter(
    (w) => w.id !== currentWorkflowId
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="搜索工作流..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : availableWorkflows.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchQuery ? '未找到匹配的工作流' : '暂无可用的工作流'}
          </div>
        ) : (
          availableWorkflows.map((workflow) => (
            <Card
              key={workflow.id}
              className={cn(
                'cursor-pointer transition-all hover:border-primary',
                selectedWorkflowId === workflow.id && 'border-primary bg-primary/5'
              )}
              onClick={() => onSelect(workflow.id, workflow.title)}
            >
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <GitBranch className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{workflow.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {workflow.nodeCount} 个节点 · {workflow.updatedAt}
                      </p>
                    </div>
                  </div>
                  {selectedWorkflowId === workflow.id && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
