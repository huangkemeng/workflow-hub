'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useVersions, useWorkflow } from '@/hooks/use-workflows';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDateTime } from '@/lib/utils';
import {
  ArrowLeft,
  RotateCcw,
  GitCommit,
  Check,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function VersionsPage() {
  const params = useParams();
  const id = params.id as string;
  const { workflow, isLoading: isLoadingWorkflow } = useWorkflow(id);
  const { versions, isLoading: isLoadingVersions, rollback } = useVersions(id);
  const [rollbackVersionId, setRollbackVersionId] = useState<string | null>(null);

  const handleRollback = async () => {
    if (rollbackVersionId) {
      await rollback(rollbackVersionId);
      setRollbackVersionId(null);
    }
  };

  if (isLoadingWorkflow || isLoadingVersions) {
    return (
      <div className="min-h-screen">
        <Header />
        <Sidebar />
        <main className="ml-64 pt-14">
          <div className="container p-8">
            <Skeleton className="h-8 w-48 mb-4" />
            <Skeleton className="h-64 w-full" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <Sidebar />
      <main className="ml-64 pt-14">
        <div className="container p-8">
          {/* 返回按钮 */}
          <Link
            href={`/workflows/${id}`}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回工作流详情
          </Link>

          {/* 标题 */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              {workflow?.title} - 版本历史
            </h1>
            <p className="text-muted-foreground">
              查看和管理工作流的所有历史版本
            </p>
          </div>

          {/* 版本时间线 */}
          <Card>
            <CardHeader>
              <CardTitle>版本列表</CardTitle>
            </CardHeader>
            <CardContent>
              {versions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  暂无版本历史
                </div>
              ) : (
                <div className="space-y-6">
                  {versions.map((version, index) => (
                    <div
                      key={version.id}
                      className="flex items-start gap-4 relative"
                    >
                      {/* 时间线 */}
                      {index !== versions.length - 1 && (
                        <div className="absolute left-4 top-8 bottom-0 w-px bg-border" />
                      )}

                      {/* 版本节点 */}
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shrink-0">
                        <GitCommit className="h-4 w-4" />
                      </div>

                      {/* 版本内容 */}
                      <div className="flex-1 pb-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium">
                                版本 {version.version}
                              </h3>
                              {index === 0 && (
                                <Badge variant="default">
                                  <Check className="mr-1 h-3 w-3" />
                                  当前版本
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {formatDateTime(version.createdAt)}
                            </p>
                            {version.changeSummary && (
                              <p className="text-sm">
                                {version.changeSummary}
                              </p>
                            )}
                          </div>
                          {index !== 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setRollbackVersionId(version.id)}
                            >
                              <RotateCcw className="mr-2 h-4 w-4" />
                              回滚到此版本
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* 回滚确认弹窗 */}
      <Dialog
        open={!!rollbackVersionId}
        onOpenChange={() => setRollbackVersionId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认回滚</DialogTitle>
            <DialogDescription>
              确定要回滚到这个版本吗？当前的工作流内容将被替换为所选版本的内容。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRollbackVersionId(null)}>
              取消
            </Button>
            <Button onClick={handleRollback}>
              <RotateCcw className="mr-2 h-4 w-4" />
              确认回滚
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
