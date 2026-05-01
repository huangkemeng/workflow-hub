'use client';

import { WorkflowListItem } from '@/types/workflow';
import { WorkflowCard } from './workflow-card';
import { Card, CardContent } from '@/components/ui/card';
import { Workflow, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';

interface WorkflowListProps {
  workflows: WorkflowListItem[];
  isLoading: boolean;
  onDelete?: (id: string) => void;
  selectedIds?: string[];
  onToggleSelect?: (id: string) => void;
}

export function WorkflowList({
  workflows,
  isLoading,
  onDelete,
  selectedIds = [],
  onToggleSelect,
}: WorkflowListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-muted rounded w-full mb-2"></div>
              <div className="h-3 bg-muted rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (workflows.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center p-12 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Workflow className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">暂无工作流</h3>
        <p className="text-muted-foreground mb-6 max-w-sm">
          您还没有创建任何工作流。点击下方的按钮创建您的第一个工作流。
        </p>
        <Link href="/workflows/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            创建工作流
          </Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {workflows.map((workflow) => (
        <div key={workflow.id} className="relative group">
          {onToggleSelect && (
            <div className="absolute top-3 left-3 z-10">
              <Checkbox
                checked={selectedIds.includes(workflow.id)}
                onCheckedChange={() => onToggleSelect(workflow.id)}
                className="h-5 w-5 border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
            </div>
          )}
          <WorkflowCard
            workflow={workflow}
            onDelete={onDelete}
            className={onToggleSelect && selectedIds.includes(workflow.id) ? 'ring-2 ring-primary' : ''}
          />
        </div>
      ))}
    </div>
  );
}
