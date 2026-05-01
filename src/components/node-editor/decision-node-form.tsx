'use client';

import { DecisionNode } from '@/types/node';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X, Plus } from 'lucide-react';

interface DecisionNodeFormProps {
  node: DecisionNode;
  onChange: (updates: Partial<DecisionNode>) => void;
}

export function DecisionNodeForm({ node, onChange }: DecisionNodeFormProps) {
  const addBranch = () => {
    const newBranch = {
      id: `branch-${Date.now()}`,
      label: `选项 ${node.data.branches.length + 1}`,
      color: '#1890ff',
    };
    onChange({
      data: {
        ...node.data,
        branches: [...node.data.branches, newBranch],
      },
    });
  };

  const updateBranch = (index: number, updates: any) => {
    const newBranches = [...node.data.branches];
    newBranches[index] = { ...newBranches[index], ...updates };
    onChange({
      data: { ...node.data, branches: newBranches },
    });
  };

  const removeBranch = (index: number) => {
    if (node.data.branches.length <= 2) {
      return; // 至少保留两个分支
    }
    const newBranches = [...node.data.branches];
    newBranches.splice(index, 1);
    onChange({
      data: { ...node.data, branches: newBranches },
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>节点标题</Label>
        <Input
          value={node.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="输入节点标题"
        />
      </div>

      <div className="space-y-2">
        <Label>判断条件</Label>
        <Input
          value={node.data.condition}
          onChange={(e) =>
            onChange({
              data: { ...node.data, condition: e.target.value },
            })
          }
          placeholder="输入判断条件"
        />
      </div>

      <div className="space-y-2">
        <Label>判断类型</Label>
        <Select
          value={node.data.decisionType}
          onValueChange={(value) =>
            onChange({
              data: { ...node.data, decisionType: value as any },
            })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="binary">二元判断（是/否）</SelectItem>
            <SelectItem value="multiple">多分支判断</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>分支选项</Label>
          {node.data.decisionType === 'multiple' && (
            <Button type="button" onClick={addBranch} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1" />
              添加分支
            </Button>
          )}
        </div>
        {node.data.branches.map((branch, index) => (
          <div key={branch.id} className="space-y-2 p-3 border rounded-md">
            <div className="flex items-center gap-2">
              <Input
                value={branch.label}
                onChange={(e) => updateBranch(index, { label: e.target.value })}
                placeholder="分支标签"
                className="flex-1"
              />
              {node.data.decisionType === 'multiple' && (
                <Button
                  type="button"
                  onClick={() => removeBranch(index)}
                  size="icon"
                  variant="ghost"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Input
              value={branch.condition || ''}
              onChange={(e) => updateBranch(index, { condition: e.target.value })}
              placeholder="分支条件（可选）"
            />
            <div className="flex items-center gap-2">
              <Input
                type="color"
                value={branch.color || '#1890ff'}
                onChange={(e) => updateBranch(index, { color: e.target.value })}
                className="w-16"
              />
              <span className="text-sm text-muted-foreground">分支颜色</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
