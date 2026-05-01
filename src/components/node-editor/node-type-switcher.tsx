'use client';

import { useState } from 'react';
import { NodeType, WorkflowNode } from '@/types/node';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertTriangle, Shuffle } from 'lucide-react';
import { getNodeTypeLabel } from '@/lib/node-utils';

interface NodeTypeSwitcherProps {
  currentType: NodeType;
  onSwitch: (newType: NodeType) => void;
}

const nodeTypes: NodeType[] = ['standard', 'decision', 'parallel', 'loop', 'subflow', 'note'];

// 类型切换时的数据迁移提示
const migrationWarnings: Partial<Record<NodeType, string>> = {
  decision: '切换为判断节点后，原有数据将被保留，但需要配置分支条件',
  parallel: '切换为并行节点后，原有数据可能丢失，建议先备份',
  loop: '切换为循环节点后，原有数据可能丢失，建议先备份',
  subflow: '切换为子流程节点后，原有数据将被清空',
  note: '切换为备注节点后，原有数据将被清空',
};

export function NodeTypeSwitcher({ currentType, onSwitch }: NodeTypeSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<NodeType | ''>('');
  const [isConfirming, setIsConfirming] = useState(false);

  const handleSelect = (type: NodeType) => {
    setSelectedType(type);
    if (migrationWarnings[type]) {
      setIsConfirming(true);
    } else {
      handleConfirm(type);
    }
  };

  const handleConfirm = (type: NodeType) => {
    onSwitch(type);
    setIsOpen(false);
    setIsConfirming(false);
    setSelectedType('');
  };

  const handleCancel = () => {
    setIsConfirming(false);
    setSelectedType('');
  };

  const availableTypes = nodeTypes.filter((type) => type !== currentType);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          <Shuffle className="mr-2 h-4 w-4" />
          切换类型
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>切换节点类型</DialogTitle>
          <DialogDescription>
            当前类型: {getNodeTypeLabel(currentType)}
          </DialogDescription>
        </DialogHeader>

        {!isConfirming ? (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">选择新类型</label>
              <Select
                value={selectedType}
                onValueChange={(value) => handleSelect(value as NodeType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择节点类型" />
                </SelectTrigger>
                <SelectContent>
                  {availableTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {getNodeTypeLabel(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-1">提示：</p>
              <ul className="list-disc list-inside space-y-1">
                <li>切换类型后，部分数据可能无法保留</li>
                <li>标准节点之间的切换会尽量保留数据</li>
                <li>特殊类型切换可能导致数据丢失</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-800">数据迁移警告</p>
                <p className="text-sm text-yellow-700 mt-1">
                  {selectedType && migrationWarnings[selectedType]}
                </p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              确定要切换节点类型吗？此操作无法撤销。
            </p>
          </div>
        )}

        <DialogFooter>
          {!isConfirming ? (
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              取消
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleCancel}>
                返回
              </Button>
              <Button
                variant="destructive"
                onClick={() => selectedType && handleConfirm(selectedType)}
              >
                确认切换
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
