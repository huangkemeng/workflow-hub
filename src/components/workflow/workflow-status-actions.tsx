'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { WorkflowStatus } from '@/types/workflow';
import {
  Rocket,
  Archive,
  RotateCcw,
  MoreHorizontal,
  CheckCircle,
  FileEdit,
} from 'lucide-react';

interface WorkflowStatusActionsProps {
  status: WorkflowStatus;
  onPublish: () => void;
  onArchive: () => void;
  onUnpublish: () => void;
  onRestore: () => void;
  isLoading?: boolean;
}

export function WorkflowStatusActions({
  status,
  onPublish,
  onArchive,
  onUnpublish,
  onRestore,
  isLoading = false,
}: WorkflowStatusActionsProps) {
  if (status === 'ARCHIVED') {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={onRestore}
        disabled={isLoading}
      >
        <RotateCcw className="mr-2 h-4 w-4" />
        恢复
      </Button>
    );
  }

  if (status === 'DRAFT') {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="default"
          size="sm"
          onClick={onPublish}
          disabled={isLoading}
        >
          <Rocket className="mr-2 h-4 w-4" />
          发布
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" disabled={isLoading}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onArchive} className="text-destructive">
              <Archive className="mr-2 h-4 w-4" />
              归档
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  // PUBLISHED
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onUnpublish}
        disabled={isLoading}
      >
        <FileEdit className="mr-2 h-4 w-4" />
        取消发布
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" disabled={isLoading}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onArchive} className="text-destructive">
            <Archive className="mr-2 h-4 w-4" />
            归档
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// 状态操作说明组件
export function WorkflowStatusHelp({ status }: { status: WorkflowStatus }) {
  const helpText: Record<WorkflowStatus, string> = {
    DRAFT: '草稿状态：可以编辑和修改工作流内容',
    PUBLISHED: '已发布：工作流已锁定，修改需要先取消发布',
    ARCHIVED: '已归档：工作流已归档，可以恢复或永久删除',
  };

  return (
    <p className="text-xs text-muted-foreground mt-1">
      {helpText[status]}
    </p>
  );
}
