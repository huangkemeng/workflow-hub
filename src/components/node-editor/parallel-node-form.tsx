'use client';

import { useState } from 'react';
import { ParallelNode, ParallelTask } from '@/types/node';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Link2, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ParallelNodeFormProps {
  node: ParallelNode;
  onChange: (updates: Partial<ParallelNode>) => void;
}

const priorityColors = {
  low: 'bg-blue-100 text-blue-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800',
};

const priorityLabels = {
  low: '低',
  medium: '中',
  high: '高',
};

const statusIcons = {
  pending: Clock,
  'in-progress': AlertCircle,
  completed: CheckCircle2,
};

export function ParallelNodeForm({ node, onChange }: ParallelNodeFormProps) {
  const { data } = node;
  const [editingTask, setEditingTask] = useState<string | null>(null);

  const handleAddTask = () => {
    const newTask: ParallelTask = {
      id: `task-${Date.now()}`,
      title: `任务 ${data.tasks.length + 1}`,
      status: 'pending',
      priority: 'medium',
    };
    onChange({
      data: {
        ...data,
        tasks: [...data.tasks, newTask],
      },
    });
  };

  const handleUpdateTask = (taskId: string, updates: Partial<ParallelTask>) => {
    onChange({
      data: {
        ...data,
        tasks: data.tasks.map((t) =>
          t.id === taskId ? { ...t, ...updates } : t
        ),
      },
    });
  };

  const handleDeleteTask = (taskId: string) => {
    // 删除任务时，需要更新其他任务的依赖关系
    const updatedTasks = data.tasks
      .filter((t) => t.id !== taskId)
      .map((t) => ({
        ...t,
        dependencies: t.dependencies?.filter((d) => d !== taskId) || [],
      }));

    onChange({
      data: {
        ...data,
        tasks: updatedTasks,
      },
    });
  };

  const handleToggleDependency = (taskId: string, dependencyId: string) => {
    const task = data.tasks.find((t) => t.id === taskId);
    if (!task) return;

    const currentDeps = task.dependencies || [];
    const newDeps = currentDeps.includes(dependencyId)
      ? currentDeps.filter((d) => d !== dependencyId)
      : [...currentDeps, dependencyId];

    handleUpdateTask(taskId, { dependencies: newDeps });
  };

  const getAvailableDependencies = (taskId: string) => {
    // 返回可以作为依赖的任务（排除当前任务和已被当前任务依赖的任务）
    return data.tasks.filter(
      (t) => t.id !== taskId && !t.dependencies?.includes(taskId)
    );
  };

  return (
    <div className="space-y-6">
      {/* 描述 */}
      <div className="space-y-2">
        <Label htmlFor="description">描述</Label>
        <Textarea
          id="description"
          placeholder="输入并行任务描述..."
          value={data.description || ''}
          onChange={(e) =>
            onChange({
              data: { ...data, description: e.target.value },
            })
          }
        />
      </div>

      {/* 完成条件 */}
      <div className="space-y-2">
        <Label>完成条件</Label>
        <Select
          value={data.completionCondition}
          onValueChange={(value: 'all' | 'any' | 'majority' | 'n') =>
            onChange({
              data: { ...data, completionCondition: value },
            })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部完成</SelectItem>
            <SelectItem value="any">任意完成</SelectItem>
            <SelectItem value="majority">多数完成</SelectItem>
            <SelectItem value="n">指定数量完成</SelectItem>
          </SelectContent>
        </Select>

        {data.completionCondition === 'n' && (
          <div className="mt-2">
            <Label htmlFor="completionCount">完成数量</Label>
            <Input
              id="completionCount"
              type="number"
              min={1}
              max={data.tasks.length}
              value={data.completionCount || 1}
              onChange={(e) =>
                onChange({
                  data: {
                    ...data,
                    completionCount: parseInt(e.target.value) || 1,
                  },
                })
              }
            />
          </div>
        )}
      </div>

      {/* 同步点设置 */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="syncPoint"
            checked={data.syncPoint?.enabled || false}
            onChange={(e) =>
              onChange({
                data: {
                  ...data,
                  syncPoint: {
                    enabled: e.target.checked,
                    description: data.syncPoint?.description,
                  },
                },
              })
            }
            className="rounded border-gray-300"
          />
          <Label htmlFor="syncPoint" className="cursor-pointer">
            启用同步点
          </Label>
        </div>

        {data.syncPoint?.enabled && (
          <Textarea
            placeholder="同步点描述..."
            value={data.syncPoint.description || ''}
            onChange={(e) =>
              onChange({
                data: {
                  ...data,
                  syncPoint: {
                    enabled: true,
                    description: e.target.value,
                  },
                },
              })
            }
          />
        )}
      </div>

      {/* 任务列表 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>任务列表 ({data.tasks.length})</Label>
          <Button type="button" variant="outline" size="sm" onClick={handleAddTask}>
            <Plus className="mr-2 h-4 w-4" />
            添加任务
          </Button>
        </div>

        {data.tasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground border rounded-lg">
            <p>暂无任务</p>
            <p className="text-sm">点击上方按钮添加任务</p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.tasks.map((task, index) => (
              <Card key={task.id} className={cn(editingTask === task.id && 'ring-2 ring-primary')}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">#{index + 1}</span>
                      {editingTask === task.id ? (
                        <Input
                          value={task.title}
                          onChange={(e) => handleUpdateTask(task.id, { title: e.target.value })}
                          className="h-8"
                          autoFocus
                          onBlur={() => setEditingTask(null)}
                          onKeyDown={(e) => e.key === 'Enter' && setEditingTask(null)}
                        />
                      ) : (
                        <CardTitle
                          className="text-sm cursor-pointer hover:text-primary"
                          onClick={() => setEditingTask(task.id)}
                        >
                          {task.title}
                        </CardTitle>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleDeleteTask(task.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  {/* 执行人 */}
                  <div className="space-y-1">
                    <Label className="text-xs">执行人</Label>
                    <Input
                      placeholder="输入执行人..."
                      value={task.assignee || ''}
                      onChange={(e) =>
                        handleUpdateTask(task.id, { assignee: e.target.value })
                      }
                      className="h-8"
                    />
                  </div>

                  {/* 优先级和状态 */}
                  <div className="flex items-center gap-2">
                    <Select
                      value={task.priority || 'medium'}
                      onValueChange={(value: 'low' | 'medium' | 'high') =>
                        handleUpdateTask(task.id, { priority: value })
                      }
                    >
                      <SelectTrigger className="h-8 w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">低</SelectItem>
                        <SelectItem value="medium">中</SelectItem>
                        <SelectItem value="high">高</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select
                      value={task.status || 'pending'}
                      onValueChange={(value: 'pending' | 'in-progress' | 'completed') =>
                        handleUpdateTask(task.id, { status: value })
                      }
                    >
                      <SelectTrigger className="h-8 flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">待处理</SelectItem>
                        <SelectItem value="in-progress">进行中</SelectItem>
                        <SelectItem value="completed">已完成</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 预计工时 */}
                  <div className="space-y-1">
                    <Label className="text-xs">预计工时（小时）</Label>
                    <Input
                      type="number"
                      min={0}
                      step={0.5}
                      value={task.estimatedHours || ''}
                      onChange={(e) =>
                        handleUpdateTask(task.id, {
                          estimatedHours: parseFloat(e.target.value) || undefined,
                        })
                      }
                      className="h-8"
                    />
                  </div>

                  {/* 任务依赖 */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Link2 className="h-3 w-3" />
                      <span>任务依赖</span>
                    </div>
                    {getAvailableDependencies(task.id).length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {getAvailableDependencies(task.id).map((depTask) => (
                          <Badge
                            key={depTask.id}
                            variant={task.dependencies?.includes(depTask.id) ? 'default' : 'outline'}
                            className="cursor-pointer text-xs"
                            onClick={() => handleToggleDependency(task.id, depTask.id)}
                          >
                            {depTask.title}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {task.dependencies && task.dependencies.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        依赖: {task.dependencies.length} 个任务
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
