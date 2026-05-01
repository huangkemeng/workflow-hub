'use client';

import { useState } from 'react';
import { LoopNode, LoopIteration } from '@/types/node';
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
import { Plus, Trash2, RotateCcw, CheckCircle2, History } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface LoopNodeFormProps {
  node: LoopNode;
  onChange: (updates: Partial<LoopNode>) => void;
}

export function LoopNodeForm({ node, onChange }: LoopNodeFormProps) {
  const { data } = node;
  const [showHistory, setShowHistory] = useState(false);

  const handleAddIteration = () => {
    const newIteration: LoopIteration = {
      id: `iteration-${Date.now()}`,
      iteration: (data.iterations?.length || 0) + 1,
      completedAt: new Date().toISOString(),
    };
    onChange({
      data: {
        ...data,
        iterations: [...(data.iterations || []), newIteration],
      },
    });
  };

  const handleUpdateIteration = (iterationId: string, updates: Partial<LoopIteration>) => {
    onChange({
      data: {
        ...data,
        iterations: data.iterations?.map((i) =>
          i.id === iterationId ? { ...i, ...updates } : i
        ),
      },
    });
  };

  const handleDeleteIteration = (iterationId: string) => {
    onChange({
      data: {
        ...data,
        iterations: data.iterations?.filter((i) => i.id !== iterationId),
      },
    });
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'yyyy-MM-dd HH:mm', { locale: zhCN });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      {/* 循环类型 */}
      <div className="space-y-2">
        <Label>循环类型</Label>
        <Select
          value={data.loopType}
          onValueChange={(value: 'fixed' | 'conditional') =>
            onChange({
              data: { ...data, loopType: value },
            })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fixed">固定次数</SelectItem>
            <SelectItem value="conditional">条件循环</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 固定次数设置 */}
      {data.loopType === 'fixed' && (
        <div className="space-y-2">
          <Label htmlFor="maxIterations">最大迭代次数</Label>
          <Input
            id="maxIterations"
            type="number"
            min={1}
            max={100}
            value={data.maxIterations || 1}
            onChange={(e) =>
              onChange({
                data: {
                  ...data,
                  maxIterations: parseInt(e.target.value) || 1,
                },
              })
            }
          />
        </div>
      )}

      {/* 条件循环设置 */}
      {data.loopType === 'conditional' && (
        <div className="space-y-2">
          <Label htmlFor="exitCondition">退出条件</Label>
          <Textarea
            id="exitCondition"
            placeholder="输入循环退出条件..."
            value={data.exitCondition || ''}
            onChange={(e) =>
              onChange({
                data: { ...data, exitCondition: e.target.value },
              })
            }
          />
          <p className="text-xs text-muted-foreground">
            当条件满足时，循环将退出
          </p>
        </div>
      )}

      {/* 最大迭代次数限制（条件循环也需要） */}
      {data.loopType === 'conditional' && (
        <div className="space-y-2">
          <Label htmlFor="maxIterationsConditional">最大迭代次数限制（防止无限循环）</Label>
          <Input
            id="maxIterationsConditional"
            type="number"
            min={1}
            max={1000}
            value={data.maxIterations || 100}
            onChange={(e) =>
              onChange({
                data: {
                  ...data,
                  maxIterations: parseInt(e.target.value) || 100,
                },
              })
            }
          />
        </div>
      )}

      {/* 迭代记录 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-muted-foreground" />
            <Label className="cursor-pointer" onClick={() => setShowHistory(!showHistory)}>
              迭代记录
            </Label>
            {data.iterations && data.iterations.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {data.iterations.length} 次
              </Badge>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddIteration}
          >
            <Plus className="mr-2 h-4 w-4" />
            记录迭代
          </Button>
        </div>

        {showHistory && (
          <div className="space-y-3">
            {(!data.iterations || data.iterations.length === 0) ? (
              <div className="text-center py-4 text-muted-foreground border rounded-lg">
                <p className="text-sm">暂无迭代记录</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {data.iterations.map((iteration, index) => (
                  <Card
                    key={iteration.id}
                    className={cn(
                      'transition-all',
                      index === data.iterations!.length - 1 && 'border-primary'
                    )}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <RotateCcw className="h-4 w-4 text-muted-foreground" />
                          <CardTitle className="text-sm">
                            第 {iteration.iteration} 次迭代
                          </CardTitle>
                          {index === data.iterations!.length - 1 && (
                            <Badge variant="default" className="text-xs">
                              最新
                            </Badge>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleDeleteIteration(iteration.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-3">
                      {/* 完成时间 */}
                      {iteration.completedAt && (
                        <p className="text-xs text-muted-foreground">
                          完成时间: {formatDate(iteration.completedAt)}
                        </p>
                      )}

                      {/* 迭代结果 */}
                      <div className="space-y-1">
                        <Label className="text-xs">迭代结果</Label>
                        <Textarea
                          placeholder="记录本次迭代的结果..."
                          value={iteration.result || ''}
                          onChange={(e) =>
                            handleUpdateIteration(iteration.id, {
                              result: e.target.value,
                            })
                          }
                          className="min-h-[60px]"
                        />
                      </div>

                      {/* 反馈 */}
                      <div className="space-y-1">
                        <Label className="text-xs">反馈/备注</Label>
                        <Textarea
                          placeholder="记录反馈或改进建议..."
                          value={iteration.feedback || ''}
                          onChange={(e) =>
                            handleUpdateIteration(iteration.id, {
                              feedback: e.target.value,
                            })
                          }
                          className="min-h-[60px]"
                        />
                      </div>

                      {/* 是否通过 */}
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`passed-${iteration.id}`}
                          checked={iteration.passed || false}
                          onChange={(e) =>
                            handleUpdateIteration(iteration.id, {
                              passed: e.target.checked,
                            })
                          }
                          className="rounded border-gray-300"
                        />
                        <Label
                          htmlFor={`passed-${iteration.id}`}
                          className="text-sm cursor-pointer flex items-center gap-1"
                        >
                          {iteration.passed && (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          )}
                          通过
                        </Label>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {!showHistory && data.iterations && data.iterations.length > 0 && (
          <div className="text-sm text-muted-foreground">
            共 {data.iterations.length} 次迭代记录，
            <button
              onClick={() => setShowHistory(true)}
              className="text-primary hover:underline"
            >
              点击查看详情
            </button>
          </div>
        )}
      </div>

      {/* 循环统计 */}
      {data.iterations && data.iterations.length > 0 && (
        <div className="p-4 bg-muted rounded-lg space-y-2">
          <h4 className="font-medium text-sm">循环统计</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">总迭代次数:</span>
              <span className="ml-2 font-medium">{data.iterations.length}</span>
            </div>
            <div>
              <span className="text-muted-foreground">通过次数:</span>
              <span className="ml-2 font-medium text-green-600">
                {data.iterations.filter((i) => i.passed).length}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">未通过次数:</span>
              <span className="ml-2 font-medium text-red-600">
                {data.iterations.filter((i) => i.passed === false).length}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">待评估:</span>
              <span className="ml-2 font-medium text-yellow-600">
                {data.iterations.filter((i) => i.passed === undefined).length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
