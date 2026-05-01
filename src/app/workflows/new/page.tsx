'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCreateWorkflow } from '@/hooks/use-workflows';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function NewWorkflowPage() {
  const router = useRouter();
  const { create, isLoading } = useCreateWorkflow();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('请输入工作流标题');
      return;
    }

    try {
      const workflow = await create({ title, description });
      router.push(`/workflows/${workflow.id}/edit`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建工作流失败');
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <Sidebar />
      <main className="ml-64 pt-14">
        <div className="container max-w-2xl p-8">
          {/* 返回按钮 */}
          <Link
            href="/workflows"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回工作流列表
          </Link>

          <Card>
            <CardHeader>
              <CardTitle>创建工作流</CardTitle>
              <CardDescription>
                填写基本信息创建新的工作流，创建后可以在编辑器中添加节点。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="title">
                    标题 <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="title"
                    placeholder="输入工作流标题"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">描述</Label>
                  <Textarea
                    id="description"
                    placeholder="输入工作流描述（可选）"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    disabled={isLoading}
                  />
                </div>

                <div className="flex justify-end gap-4">
                  <Link href="/workflows">
                    <Button type="button" variant="outline" disabled={isLoading}>
                      取消
                    </Button>
                  </Link>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    创建工作流
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
