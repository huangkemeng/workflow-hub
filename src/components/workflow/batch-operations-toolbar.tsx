'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  CheckSquare,
  Square,
  Trash2,
  Archive,
  Globe,
  MoreHorizontal,
  X,
  EyeOff,
} from 'lucide-react';
import { WorkflowListItem } from '@/types/workflow';
import { BatchOperationResult } from '@/hooks/use-batch-operations';

interface BatchOperationsToolbarProps {
  workflows: WorkflowListItem[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onBatchDelete: (ids: string[]) => Promise<BatchOperationResult>;
  onBatchPublish: (ids: string[]) => Promise<BatchOperationResult>;
  onBatchUnpublish: (ids: string[]) => Promise<BatchOperationResult>;
  onBatchArchive: (ids: string[]) => Promise<BatchOperationResult>;
  isProcessing: boolean;
  progress: number;
}

export function BatchOperationsToolbar({
  workflows,
  selectedIds,
  onSelectionChange,
  onBatchDelete,
  onBatchPublish,
  onBatchUnpublish,
  onBatchArchive,
  isProcessing,
  progress,
}: BatchOperationsToolbarProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [lastResult, setLastResult] = useState<BatchOperationResult | null>(null);
  const [operationType, setOperationType] = useState<string>('');

  const selectedCount = selectedIds.length;
  const allSelected = workflows.length > 0 && selectedCount === workflows.length;
  const someSelected = selectedCount > 0 && selectedCount < workflows.length;

  const handleSelectAll = () => {
    if (allSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(workflows.map((w) => w.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((sid) => sid !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  const executeBatchOperation = async (
    operation: (ids: string[]) => Promise<BatchOperationResult>,
    type: string
  ) => {
    setOperationType(type);
    const result = await operation(selectedIds);
    setLastResult(result);
    setShowResultDialog(true);
    if (result.failed.length === 0) {
      onSelectionChange([]);
    }
  };

  const handleDelete = async () => {
    setShowDeleteDialog(false);
    await executeBatchOperation(onBatchDelete, '删除');
  };

  if (selectedCount === 0) {
    return (
      <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSelectAll}
          className="text-muted-foreground"
        >
          <Square className="mr-2 h-4 w-4" />
          全选
        </Button>
        <span className="text-sm text-muted-foreground">
          共 {workflows.length} 个工作流
        </span>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between p-2 bg-primary/5 border border-primary/20 rounded-lg">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSelectAll}
          >
            <CheckSquare className="mr-2 h-4 w-4" />
            {allSelected ? '取消全选' : '全选'}
          </Button>
          <Badge variant="secondary">
            已选择 {selectedCount} 项
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSelectionChange([])}
          >
            <X className="mr-2 h-4 w-4" />
            取消选择
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={isProcessing}>
                <MoreHorizontal className="mr-2 h-4 w-4" />
                批量操作
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => executeBatchOperation(onBatchPublish, '发布')}
                disabled={isProcessing}
              >
                <Globe className="mr-2 h-4 w-4" />
                批量发布
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => executeBatchOperation(onBatchUnpublish, '取消发布')}
                disabled={isProcessing}
              >
                <EyeOff className="mr-2 h-4 w-4" />
                批量取消发布
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => executeBatchOperation(onBatchArchive, '归档')}
                disabled={isProcessing}
              >
                <Archive className="mr-2 h-4 w-4" />
                批量归档
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setShowDeleteDialog(true)}
                disabled={isProcessing}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                批量删除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* 进度条 */}
      {isProcessing && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>正在处理...</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} />
        </div>
      )}

      {/* 删除确认对话框 */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认批量删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除选中的 {selectedCount} 个工作流吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive"
            >
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 操作结果对话框 */}
      <AlertDialog open={showResultDialog} onOpenChange={setShowResultDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>批量{operationType}结果</AlertDialogTitle>
            <AlertDialogDescription>
              {lastResult && (
                <div className="space-y-2 mt-2">
                  <p className="text-green-600">
                    成功: {lastResult.success.length} 个
                  </p>
                  {lastResult.failed.length > 0 && (
                    <div className="text-red-600">
                      <p>失败: {lastResult.failed.length} 个</p>
                      <ul className="text-sm mt-1 max-h-32 overflow-y-auto">
                        {lastResult.failed.map((item) => (
                          <li key={item.id} className="text-muted-foreground">
                            {item.id}: {item.error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>确定</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
