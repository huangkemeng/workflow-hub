'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { useWorkflow } from '@/hooks/use-workflows';
import { useWorkflowStatus } from '@/hooks/use-workflow-status';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDateTime } from '@/lib/utils';
import { ExportModal } from '@/components/export/export-modal';
import { WorkflowStatusBadge } from '@/components/workflow/workflow-status-badge';
import { WorkflowStatusActions, WorkflowStatusHelp } from '@/components/workflow/workflow-status-actions';
import {
  ArrowLeft,
  Edit,
  Share2,
  Download,
  History,
  GitBranch,
  Clock,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';

export default function WorkflowDetailPage() {
  // 认证检查
  const { isLoading: authLoading } = useRequireAuth();
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { workflow, isLoading, error, refetch } = useWorkflow(id);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const {
    status,
    isLoading: isStatusLoading,
    publish,
    unpublish,
    archive,
    restore,
  } = useWorkflowStatus({
    workflowId: id,
    initialStatus: workflow?.status || 'DRAFT',
    onStatusChange: () => {
      refetch();
    },
  });

  const handlePublish = async () => {
    try {
      await publish();
      toast.success('工作流已发布');
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '发布失败');
    }
  };

  const handleUnpublish = async () => {
    try {
      await unpublish();
      toast.success('工作流已取消发布');
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '取消发布失败');
    }
  };

  const handleArchive = async () => {
    try {
      await archive();
      toast.success('工作流已归档');
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '归档失败');
    }
  };

  const handleRestore = async () => {
    try {
      await restore();
      toast.success('工作流已恢复');
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '恢复失败');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <Sidebar />
        <main className="ml-64 pt-14">
          <div className="container p-8">
            <Skeleton className="h-8 w-48 mb-4" />
            <Skeleton className="h-4 w-96 mb-8" />
            <Skeleton className="h-64 w-full" />
          </div>
        </main>
      </div>
    );
  }

  if (error || !workflow) {
    return (
      <div className="min-h-screen">
        <Header />
        <Sidebar />
        <main className="ml-64 pt-14">
          <div className="container p-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">工作流不存在</h1>
              <p className="text-muted-foreground mb-6">
                抱歉，您访问的工作流不存在或已被删除。
              </p>
              <Link href="/workflows">
                <Button>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  返回工作流列表
                </Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // 归档状态下隐藏编辑按钮
  const canEdit = workflow.status !== 'ARCHIVED';
  const isPublished = workflow.status === 'PUBLISHED';

  return (
    <div className="min-h-screen">
      <Header />
      <Sidebar />
      <main className="ml-64 pt-14">
        <div className="container p-8">
          {/* 返回按钮 */}
          <Link
            href="/workflows"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回工作流列表
          </Link>

          {/* 标题栏 */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{workflow.title}</h1>
                <WorkflowStatusBadge status={workflow.status} />
              </div>
              <p className="text-muted-foreground">
                {workflow.description || '暂无描述'}
              </p>
              <WorkflowStatusHelp status={workflow.status} />
            </div>
            <div className="flex items-center gap-2">
              <WorkflowStatusActions
                status={workflow.status}
                onPublish={handlePublish}
                onUnpublish={handleUnpublish}
                onArchive={handleArchive}
                onRestore={handleRestore}
                isLoading={isStatusLoading}
              />
              <div className="w-px h-6 bg-border mx-2" />
              {canEdit && (
                <Link href={`/workflows/${id}/edit`}>
                  <Button variant="outline" size="sm">
                    <Edit className="mr-2 h-4 w-4" />
                    编辑
                  </Button>
                </Link>
              )}
              <Link href={`/workflows/${id}/share`}>
                <Button variant="outline" size="sm">
                  <Share2 className="mr-2 h-4 w-4" />
                  分享
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={() => setIsExportModalOpen(true)}>
                <Download className="mr-2 h-4 w-4" />
                导出
              </Button>
              <Link href={`/workflows/${id}/versions`}>
                <Button variant="outline" size="sm">
                  <History className="mr-2 h-4 w-4" />
                  版本
                </Button>
              </Link>
            </div>
          </div>

          {/* 统计信息 */}
          <div className="grid gap-4 md:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">节点数量</CardTitle>
                <GitBranch className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{workflow.nodes.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">当前版本</CardTitle>
                <History className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">v{workflow.currentVersion}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">创建时间</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold">
                  {formatDateTime(workflow.createdAt)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">更新时间</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold">
                  {formatDateTime(workflow.updatedAt)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 节点预览 */}
          <Card>
            <CardHeader>
              <CardTitle>节点预览</CardTitle>
            </CardHeader>
            <CardContent>
              {workflow.nodes.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  暂无节点，点击"编辑"按钮添加节点
                </div>
              ) : (
                <div className="space-y-4">
                  {workflow.nodes.map((node, index) => (
                    <div
                      key={node.id}
                      className="flex items-start gap-4 p-4 rounded-lg border"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{node.title}</h3>
                          <Badge variant="outline">{node.type}</Badge>
                        </div>
                        {node.type === 'standard' && node.data.event && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {node.data.event.content}
                          </p>
                        )}
                        {node.type === 'decision' && node.data.condition && (
                          <p className="text-sm text-muted-foreground mt-1">
                            判断条件: {node.data.condition}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* 导出弹窗 */}
      {workflow && (
        <ExportModal
          workflow={workflow}
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
        />
      )}
    </div>
  );
}
