'use client';

import { useState, useEffect } from 'react';
import { useWorkflows } from '@/hooks/use-workflows';
import { useShareStats } from '@/hooks/use-share-stats';
import { useBatchOperations } from '@/hooks/use-batch-operations';
import { useToastContext } from '@/providers/toast-provider';
import { useConfirm } from '@/hooks/use-confirm';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { WorkflowList } from '@/components/workflow/workflow-list';
import { BatchOperationsToolbar } from '@/components/workflow/batch-operations-toolbar';
import { ShareStatsCard } from '@/components/share/share-stats-card';
import { SkeletonCard } from '@/components/ui/skeleton-card';
import { EmptyState } from '@/components/ui/empty-state';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search, BarChart3, Workflow } from 'lucide-react';
import Link from 'next/link';

export default function WorkflowsPage() {
  // 认证检查 - 未登录会自动跳转到登录页
  const { isLoading: authLoading } = useRequireAuth();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState('updated-desc');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showStats, setShowStats] = useState(false);

  const { success, error } = useToastContext();
  const { confirm, confirmState, handleConfirm, handleCancel } = useConfirm();

  const { workflows, total, isLoading, error: workflowsError, deleteWorkflow, refetch } = useWorkflows({
    search,
    status: status === 'all' ? undefined : status,
    sort,
  });

  // 显示错误提示
  useEffect(() => {
    if (workflowsError) {
      error(workflowsError);
    }
  }, [workflowsError, error]);

  const { stats: shareStats, isLoading: statsLoading } = useShareStats();

  const {
    isProcessing,
    progress,
    batchDelete,
    batchPublish,
    batchUnpublish,
    batchArchive,
  } = useBatchOperations();

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await deleteWorkflow(deleteId);
        success('工作流已删除');
        setDeleteId(null);
      } catch (err) {
        error(err instanceof Error ? err.message : '删除失败');
      }
    }
  };

  const handleBatchDelete = async (ids: string[]) => {
    const result = await batchDelete(ids);
    if (result.failed.length === 0) {
      success(`成功删除 ${result.success.length} 个工作流`);
      refetch();
      setSelectedIds([]);
    } else {
      error(`${result.failed.length} 个工作流删除失败`);
    }
    return result;
  };

  const handleBatchPublish = async (ids: string[]) => {
    const result = await batchPublish(ids);
    if (result.failed.length === 0) {
      success(`成功发布 ${result.success.length} 个工作流`);
      refetch();
      setSelectedIds([]);
    } else {
      error(`${result.failed.length} 个工作流发布失败`);
    }
    return result;
  };

  const handleBatchUnpublish = async (ids: string[]) => {
    const result = await batchUnpublish(ids);
    if (result.failed.length === 0) {
      success(`成功取消发布 ${result.success.length} 个工作流`);
      refetch();
      setSelectedIds([]);
    } else {
      error(`${result.failed.length} 个工作流取消发布失败`);
    }
    return result;
  };

  const handleBatchArchive = async (ids: string[]) => {
    const result = await batchArchive(ids);
    if (result.failed.length === 0) {
      success(`成功归档 ${result.success.length} 个工作流`);
      refetch();
      setSelectedIds([]);
    } else {
      error(`${result.failed.length} 个工作流归档失败`);
    }
    return result;
  };

  const handleDeleteClick = async (id: string) => {
    const confirmed = await confirm({
      title: '确认删除',
      description: '确定要删除这个工作流吗？此操作无法撤销。',
      confirmText: '删除',
      cancelText: '取消',
      variant: 'destructive',
    });
    if (confirmed) {
      setDeleteId(id);
      handleDelete();
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <Sidebar />
      <main className="ml-64 pt-14">
        <div className="container p-8">
          {/* 页面标题 */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">工作流</h1>
              <p className="text-muted-foreground mt-1">
                管理您的工作流，共 {total} 个
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setShowStats(!showStats)}
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                {showStats ? '隐藏统计' : '分享统计'}
              </Button>
              <Link href="/workflows/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  创建工作流
                </Button>
              </Link>
            </div>
          </div>

          {/* 分享统计 */}
          {showStats && (
            <div className="mb-6">
              <ShareStatsCard stats={shareStats} isLoading={statsLoading} />
            </div>
          )}

          {/* 搜索和筛选 */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索工作流..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="状态筛选" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="DRAFT">草稿</SelectItem>
                <SelectItem value="PUBLISHED">已发布</SelectItem>
                <SelectItem value="ARCHIVED">已归档</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="排序方式" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="updated-desc">最近更新</SelectItem>
                <SelectItem value="updated-asc">最早更新</SelectItem>
                <SelectItem value="title-asc">名称 A-Z</SelectItem>
                <SelectItem value="title-desc">名称 Z-A</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 批量操作工具栏 */}
          <div className="mb-4">
            <BatchOperationsToolbar
              workflows={workflows}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
              onBatchDelete={handleBatchDelete}
              onBatchPublish={handleBatchPublish}
              onBatchUnpublish={handleBatchUnpublish}
              onBatchArchive={handleBatchArchive}
              isProcessing={isProcessing}
              progress={progress}
            />
          </div>

          {/* 工作流列表 */}
          {isLoading ? (
            <SkeletonCard count={6} columns={3} />
          ) : workflows.length === 0 ? (
            <EmptyState
              icon={Workflow}
              title="暂无工作流"
              description="您还没有创建任何工作流。点击下方的按钮创建您的第一个工作流。"
              action={{
                label: '创建工作流',
                onClick: () => window.location.href = '/workflows/new',
              }}
            />
          ) : (
            <WorkflowList
              workflows={workflows}
              isLoading={isLoading}
              onDelete={handleDeleteClick}
              selectedIds={selectedIds}
              onToggleSelect={(id) => {
                if (selectedIds.includes(id)) {
                  setSelectedIds(selectedIds.filter((sid) => sid !== id));
                } else {
                  setSelectedIds([...selectedIds, id]);
                }
              }}
            />
          )}
        </div>
      </main>

      {/* 确认对话框 */}
      <ConfirmDialog
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        description={confirmState.description}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
        variant={confirmState.variant}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </div>
  );
}
