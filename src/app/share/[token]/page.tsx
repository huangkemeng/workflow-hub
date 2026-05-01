'use client';

import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import { useSharedWorkflow } from '@/hooks/use-share';
import { ReadonlyWorkflowView } from '@/components/share/readonly-workflow-view';
import { ExportModal } from '@/components/export/export-modal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Eye, AlertCircle, Download } from 'lucide-react';
import { useState } from 'react';

export default function SharePage() {
  const params = useParams();
  const token = params.token as string;
  const { workflow, isLoading, error, fetchSharedWorkflow } = useSharedWorkflow(token);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  useEffect(() => {
    fetchSharedWorkflow();
  }, [fetchSharedWorkflow]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/30">
        <div className="container max-w-4xl py-8">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-4 w-full mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !workflow) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h1 className="text-xl font-bold mb-2">链接无效</h1>
            <p className="text-muted-foreground">
              {error || '该分享链接不存在或已过期'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* 顶部信息栏 */}
      <div className="bg-background border-b">
        <div className="container max-w-4xl py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="font-semibold">{workflow.title}</h1>
                {workflow.description && (
                  <p className="text-sm text-muted-foreground">
                    {workflow.description}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Eye className="h-4 w-4" />
                <span>{workflow.share?.accessCount || 0} 次访问</span>
              </div>
              {workflow.share?.allowExport && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsExportModalOpen(true)}
                >
                  <Download className="mr-2 h-4 w-4" />
                  导出
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 工作流内容 */}
      <div className="container max-w-4xl py-8">
        <ReadonlyWorkflowView workflow={workflow} />
      </div>

      {/* 导出弹窗 */}
      {workflow.share?.allowExport && (
        <ExportModal
          workflow={workflow}
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
        />
      )}
    </div>
  );
}
