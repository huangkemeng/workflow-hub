'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useWorkflow } from '@/hooks/use-workflows';
import { useShare } from '@/hooks/use-share';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { ShareModal } from '@/components/share/share-modal';
import { ShareLinkCard } from '@/components/share/share-link-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Plus, Share2, Link as LinkIcon } from 'lucide-react';

export default function ShareManagementPage() {
  const params = useParams();
  const id = params.id as string;
  const { workflow, isLoading: isWorkflowLoading } = useWorkflow(id);
  const { shareLinks, isLoading: isShareLoading, fetchShareLinks } = useShare({ workflowId: id });
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  useEffect(() => {
    fetchShareLinks();
  }, [fetchShareLinks]);

  const isLoading = isWorkflowLoading || isShareLoading;
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <Sidebar />
        <main className="ml-64 pt-14">
          <div className="container p-8">
            <Skeleton className="h-8 w-64 mb-4" />
            <Skeleton className="h-32 w-full" />
          </div>
        </main>
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="min-h-screen">
        <Header />
        <Sidebar />
        <main className="ml-64 pt-14">
          <div className="container p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">工作流不存在</h1>
            <Link href="/workflows">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                返回工作流列表
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const activeLinks = shareLinks.filter(
    (link) => !link.expiresAt || new Date(link.expiresAt) > new Date()
  );

  const expiredLinks = shareLinks.filter(
    (link) => link.expiresAt && new Date(link.expiresAt) <= new Date()
  );

  return (
    <div className="min-h-screen">
      <Header />
      <Sidebar />
      <main className="ml-64 pt-14">
        <div className="container p-8">
          {/* 页面标题 */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link href={`/workflows/${id}`}>
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">分享管理</h1>
                <p className="text-muted-foreground">{workflow.title}</p>
              </div>
            </div>
            <Button onClick={() => setIsShareModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              创建分享
            </Button>
          </div>

          {/* 统计卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  活跃分享
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{activeLinks.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  总访问次数
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {shareLinks.reduce((sum, link) => sum + link.viewCount, 0)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  已过期
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{expiredLinks.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* 活跃分享链接 */}
          {activeLinks.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                活跃分享链接
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeLinks.map((link) => (
                  <ShareLinkCard
                    key={link.id}
                    shareLink={link}
                    onRevoke={() => fetchShareLinks()}
                    baseUrl={baseUrl}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 已过期链接 */}
          {expiredLinks.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-muted-foreground">
                <LinkIcon className="h-5 w-5" />
                已过期链接
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-50">
                {expiredLinks.map((link) => (
                  <ShareLinkCard
                    key={link.id}
                    shareLink={link}
                    onRevoke={() => {}}
                    baseUrl={baseUrl}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 空状态 */}
          {shareLinks.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <Share2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">暂无分享链接</h3>
                <p className="text-muted-foreground mb-4">
                  创建分享链接，让其他人可以查看您的工作流
                </p>
                <Button onClick={() => setIsShareModalOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  创建分享
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* 分享弹窗 */}
      <ShareModal
        workflowId={id}
        isOpen={isShareModalOpen}
        onClose={() => {
          setIsShareModalOpen(false);
          fetchShareLinks();
        }}
        baseUrl={baseUrl}
      />
    </div>
  );
}
