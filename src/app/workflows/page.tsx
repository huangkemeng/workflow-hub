'use client';

import { useState } from 'react';
import { useWorkflows } from '@/hooks/use-workflows';
import { useShareStats } from '@/hooks/use-share-stats';
import { useBatchOperations } from '@/hooks/use-batch-operations';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { WorkflowList } from '@/components/workflow/workflow-list';
import { BatchOperationsToolbar } from '@/components/workflow/batch-operations-toolbar';
import { ShareStatsCard } from '@/components/share/share-stats-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function WorkflowsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState('updated-desc');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showStats, setShowStats] = useState(false);

  const { workflows, total, isLoading, deleteWorkflow, refetch } = useWorkflows({
    search,
    status: status === 'all' ? undefined : status,
    sort,
  });

  const { stats: shareStats, isLoading: statsLoading } = useShareStats();

  const {
    isProcessing,
    progress,
    batchDelete,
    batchPublish,
    batchUnpublish,
    batchArchive,
    reset: resetBatch,
  } = useBatchOperations();

  const handleDelete = async () => {
    if (deleteId) {
      await deleteWorkflow(deleteId);
      setDeleteId(null);
    }
  };

  const handleBatchDelete = async (ids: string[]) => {
    const result = await batchDelete(ids);
    if (result.failed.length === 0) {
      refetch();
    }
    return result;
  };

  const handleBatchPublish = async (ids: string[]) => {
    const result = await batchPublish(ids);
    if (result.failed.length === 0) {
      refetch();
    }
    return result;
  };

  const handleBatchUnpublish = async (ids: string[]) => {
    const result = await batchUnpublish(ids);
    if (result.failed.length === 0) {
      refetch();
    }
    return result;
  };

  const handleBatchArchive = async (ids: string[]) => {
    const result = await batchArchive(ids);
    if (result.failed.length === 0) {
      refetch();
    }
    return result;
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
          <WorkflowList
            workflows={workflows}
            isLoading={isLoading}
            onDelete={setDeleteId}
            selectedIds={selectedIds}
            onToggleSelect={(id) => {
              if (selectedIds.includes(id)) {
                setSelectedIds(selectedIds.filter((sid) => sid !== id));
              } else {
                setSelectedIds([...selectedIds, id]);
              }
            }}
          />
        </div>
      </main>

      {/* 删除确认弹窗 */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              确定要删除这个工作流吗？此操作无法撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
