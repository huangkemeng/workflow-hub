'use client';

import Link from 'next/link';
import { WorkflowListItem } from '@/types/workflow';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDateTime, cn } from '@/lib/utils';
import { GitBranch, Clock, MoreHorizontal, Edit, Share2, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface WorkflowCardProps {
  workflow: WorkflowListItem;
  onDelete?: (id: string) => void;
  className?: string;
}

const statusMap = {
  DRAFT: { label: '草稿', variant: 'secondary' as const },
  PUBLISHED: { label: '已发布', variant: 'default' as const },
  ARCHIVED: { label: '已归档', variant: 'outline' as const },
};

export function WorkflowCard({ workflow, onDelete, className }: WorkflowCardProps) {
  const status = statusMap[workflow.status];

  return (
    <Card className={cn(
      "group relative hover:shadow-md transition-shadow",
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <Link href={`/workflows/${workflow.id}`}>
              <CardTitle className="text-lg truncate hover:text-primary cursor-pointer">
                {workflow.title}
              </CardTitle>
            </Link>
            <CardDescription className="mt-1 line-clamp-2">
              {workflow.description || '暂无描述'}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/workflows/${workflow.id}`}>
                  <Edit className="mr-2 h-4 w-4" />
                  编辑
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/workflows/${workflow.id}/share`}>
                  <Share2 className="mr-2 h-4 w-4" />
                  分享
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete?.(workflow.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                删除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <GitBranch className="h-4 w-4" />
              <span>{workflow.nodeCount} 个节点</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{formatDateTime(workflow.updatedAt)}</span>
            </div>
          </div>
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
