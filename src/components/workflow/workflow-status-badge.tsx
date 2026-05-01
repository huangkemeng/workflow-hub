'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { WorkflowStatus } from '@/types/workflow';

interface WorkflowStatusBadgeProps {
  status: WorkflowStatus;
  className?: string;
}

const statusConfig: Record<WorkflowStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string }> = {
  DRAFT: {
    label: '草稿',
    variant: 'secondary',
    className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200',
  },
  PUBLISHED: {
    label: '已发布',
    variant: 'default',
    className: 'bg-green-100 text-green-800 hover:bg-green-100 border-green-200',
  },
  ARCHIVED: {
    label: '已归档',
    variant: 'outline',
    className: 'bg-gray-100 text-gray-600 hover:bg-gray-100 border-gray-200',
  },
};

export function WorkflowStatusBadge({ status, className }: WorkflowStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge
      variant={config.variant}
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  );
}
