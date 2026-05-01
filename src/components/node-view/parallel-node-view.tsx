'use client';

import { ParallelNode } from '@/types/node';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Layers, CheckCircle2, Clock, User } from 'lucide-react';

interface ParallelNodeViewProps {
  node: ParallelNode;
  isSelected?: boolean;
  onClick?: () => void;
}

const statusMap = {
  pending: { label: '待处理', variant: 'secondary' as const },
  'in-progress': { label: '进行中', variant: 'default' as const },
  completed: { label: '已完成', variant: 'default' as const },
};

const priorityMap = {
  low: { label: '低', color: 'bg-blue-100 text-blue-800' },
  medium: { label: '中', color: 'bg-yellow-100 text-yellow-800' },
  high: { label: '高', color: 'bg-red-100 text-red-800' },
};

export function ParallelNodeView({ node, isSelected, onClick }: ParallelNodeViewProps) {
  const completedCount = node.data.tasks.filter(t => t.status === 'completed').length;
  const totalCount = node.data.tasks.length;

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
            <Layers className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">{node.title}</CardTitle>
          </div>
          <Badge variant="outline">
            {completedCount}/{totalCount} 完成
          </Badge>
        </div>
        {node.data.description && (
          <p className="text-sm text-muted-foreground">{node.data.description}</p>
        )}
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        {node.data.tasks.map((task) => {
          const status = task.status ? statusMap[task.status] : null;
          const priority = task.priority ? priorityMap[task.priority] : null;
          
          return (
            <div
              key={task.id}
              className="flex items-center gap-2 p-2 rounded-md border"
            >
              <CheckCircle2 className={`h-4 w-4 ${
                task.status === 'completed' ? 'text-green-500' : 'text-muted-foreground'
              }`} />
              <span className="flex-1 text-sm truncate">{task.title}</span>
              {task.assignee && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <User className="h-3 w-3" />
                  {task.assignee}
                </div>
              )}
              {task.estimatedHours && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {task.estimatedHours}h
                </div>
              )}
              {status && (
                <Badge variant={status.variant} className="text-xs">
                  {status.label}
                </Badge>
              )}
              {priority && (
                <span className={`text-xs px-2 py-0.5 rounded ${priority.color}`}>
                  {priority.label}
                </span>
              )}
            </div>
          );
        })}

        {/* 完成条件 */}
        <div className="mt-3 pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            完成条件: {node.data.completionCondition === 'all' && '全部完成'}
            {node.data.completionCondition === 'any' && '任意完成'}
            {node.data.completionCondition === 'majority' && '多数完成'}
            {node.data.completionCondition === 'n' && `${node.data.completionCount}个完成`}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
