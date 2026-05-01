'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useWorkflow } from '@/hooks/use-workflows';
import { useNodeEditor } from '@/hooks/use-node-editor';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { WorkflowCanvas } from '@/components/canvas/workflow-canvas';
import { NodeTypeSelector } from '@/components/node-editor/node-type-selector';
import { NodePropertyEditor } from '@/components/node-editor/node-property-editor';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Save, Eye, Loader2 } from 'lucide-react';
import { useState, useCallback, useEffect } from 'react';
import { WorkflowNode } from '@/types/node';

export default function EditWorkflowPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { workflow, isLoading } = useWorkflow(id);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleNodesChange = useCallback((newNodes: WorkflowNode[]) => {
    setHasChanges(true);
  }, []);

  const {
    nodes,
    selectedNodeId,
    addNode,
    updateNode,
    deleteNode,
    selectNode,
    getSelectedNode,
  } = useNodeEditor({
    initialNodes: workflow?.nodes || [],
    onChange: handleNodesChange,
  });

  // 当 workflow 加载完成后更新节点
  useEffect(() => {
    if (workflow?.nodes) {
      // 这里可以通过 refetch 或其他方式更新初始节点
    }
  }, [workflow]);

  const handleSave = async () => {
    setIsSaving(true);
    // 模拟保存
    await new Promise(resolve => setTimeout(resolve, 1000));
    setHasChanges(false);
    setIsSaving(false);
  };

  const handleUpdateNode = (updates: Partial<WorkflowNode>) => {
    if (selectedNodeId) {
      updateNode(selectedNodeId, updates);
    }
  };

  const handleDeleteNode = () => {
    if (selectedNodeId) {
      deleteNode(selectedNodeId);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <Sidebar />
        <main className="ml-64 pt-14">
          <div className="h-[calc(100vh-3.5rem)] flex items-center justify-center">
            <Skeleton className="h-8 w-48" />
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

  return (
    <div className="min-h-screen">
      <Header />
      <Sidebar />
      <main className="ml-64 pt-14">
        {/* 顶部工具栏 */}
        <div className="h-14 border-b flex items-center justify-between px-6 bg-background">
          <div className="flex items-center gap-4">
            <Link href={`/workflows/${id}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                返回
              </Button>
            </Link>
            <div>
              <h1 className="font-semibold">{workflow.title}</h1>
              {hasChanges && (
                <span className="text-xs text-muted-foreground">有未保存的更改</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/workflows/${id}`}>
              <Button variant="outline" size="sm">
                <Eye className="mr-2 h-4 w-4" />
                预览
              </Button>
            </Link>
            <Button size="sm" onClick={handleSave} disabled={isSaving || !hasChanges}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              保存
            </Button>
          </div>
        </div>

        {/* 编辑器主体 */}
        <div className="h-[calc(100vh-7rem)] flex">
          {/* 左侧：节点类型选择器 */}
          <div className="w-64 border-r bg-muted/30 overflow-y-auto">
            <div className="p-4">
              <NodeTypeSelector onSelect={addNode} />
            </div>
          </div>

          {/* 中央：画布 */}
          <div className="flex-1 bg-muted/10">
            <WorkflowCanvas
              nodes={nodes}
              selectedNodeId={selectedNodeId}
              onSelectNode={selectNode}
            />
          </div>

          {/* 右侧：属性编辑器 */}
          <div className="w-80 border-l bg-background overflow-y-auto">
            <NodePropertyEditor
              node={getSelectedNode()}
              onChange={handleUpdateNode}
              onDelete={handleDeleteNode}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
