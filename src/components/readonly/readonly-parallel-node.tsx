'use client';

import { ParallelNode } from '@/types/node';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Layers, CheckCircle2, Clock, User, Link2, GitMerge } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface ReadonlyParallelNodeProps {
  node: ParallelNode;
  stepNumber: number;
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

export function ReadonlyParallelNode({ node, stepNumber }: ReadonlyParallelNodeProps) {
  const completedCount = node.data.tasks.filter((t) => t.status === 'completed').length;
  const totalCount = node.data.tasks.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const tasksWithDeps = node.data.tasks.filter(t => t.dependencies && t.dependencies.length > 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground mb-1">步骤 {stepNumber}</p>
              <CardTitle>{node.title}</CardTitle>
            </div>
          </div>
          <Badge variant="outline">
            {completedCount}/{totalCount} 完成
          </Badge>
        </div>
        {node.data.description && (
          <p className="text-sm text-muted-foreground">{node.data.description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 进度条 */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">完成进度</span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} />
        </div>

        {/* 任务列表 */}
        <div className="space-y-2">
          <p className="text-sm font-medium">并行任务</p>
          <div className="space-y-2">
            {node.data.tasks.map((task) => {
              const status = task.status ? statusMap[task.status] : null;
              const priority = task.priority ? priorityMap[task.priority] : null;
              const hasDeps = task.dependencies && task.dependencies.length > 0;

              return (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-3 rounded-lg border"
                >
                  <CheckCircle2
                    className={`h-5 w-5 ${
                      task.status === 'completed'
                        ? 'text-green-500'
                        : 'text-muted-foreground'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm block">{task.title}</span>
                    {hasDeps && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Link2 className="h-3 w-3" />
                        依赖 {task.dependencies!.length} 个任务
                      </span>
                    )}
                  </div>
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
          </div>
        </div>

        {/* 任务依赖图 */}
        {tasksWithDeps.length > 0 && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-2 flex items-center gap-2">
              <Link2 className="h-4 w-4" />
              任务依赖关系
            </p>
            <div className="space-y-1 text-sm">
              {tasksWithDeps.map(task => (
                <div key={task.id} className="flex items-center gap-2">
                  <span className="font-medium">{task.title}</span>
                  <span className="text-muted-foreground">依赖</span>
                  <div className="flex items-center gap-1">
                    {task.dependencies!.map(depId => {
                      const depTask = node.data.tasks.find(t => t.id === depId);
                      return depTask ? (
                        <Badge key={depId} variant="outline" className="text-xs">
                          {depTask.title}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 同步点 */}
        {node.data.syncPoint?.enabled && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-medium text-blue-800 flex items-center gap-2">
              <GitMerge className="h-4 w-4" />
              同步点
            </p>
            {node.data.syncPoint.description && (
              <p className="text-sm text-blue-700 mt-1">
                {node.data.syncPoint.description}
              </p>
            )}
          </div>
        )}

        {/* 完成条件 */}
        <div className="p-3 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            完成条件:{' '}
            {node.data.completionCondition === 'all' && '全部任务完成'}
            {node.data.completionCondition === 'any' && '任意任务完成'}
            {node.data.completionCondition === 'majority' && '多数任务完成'}
            {node.data.completionCondition === 'n' &&
              `${node.data.completionCount}个任务完成`}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
