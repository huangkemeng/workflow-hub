'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useWorkflow } from '@/hooks/use-workflows';
import { useNodeEditor } from '@/hooks/use-node-editor';
import { useConnections } from '@/hooks/use-connections';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { WorkflowCanvas } from '@/components/canvas/workflow-canvas';
import { NodeTypeSelector } from '@/components/node-editor/node-type-selector';
import { NodePropertyEditor } from '@/components/node-editor/node-property-editor';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Save, Eye, Loader2, GitBranch } from 'lucide-react';
import { useState, useCallback, useEffect } from 'react';
import { WorkflowNode } from '@/types/node';
import { Connection } from '@/types/connection';
import { api } from '@/lib/api';
import { removeNodeConnections } from '@/lib/connection-utils';

export default function EditWorkflowPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { workflow, isLoading, refetch } = useWorkflow(id);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleNodesChange = useCallback((newNodes: WorkflowNode[]) => {
    setHasChanges(true);
    setSaveError(null);
  }, []);

  const handleConnectionsChange = useCallback((newConnections: Connection[]) => {
    setHasChanges(true);
    setSaveError(null);
  }, []);

  const {
    nodes,
    selectedNodeId,
    addNode,
    updateNode,
    deleteNode,
    selectNode,
    getSelectedNode,
    setNodes,
  } = useNodeEditor({
    initialNodes: workflow?.nodes || [],
    onChange: handleNodesChange,
  });

  const {
    connections,
    selectedConnectionId,
    isCreating,
    tempConnection,
    startConnection,
    completeConnection,
    cancelConnection,
    deleteConnection,
    updateConnection,
    selectConnection,
    getSelectedConnection,
    setConnections,
  } = useConnections({
    initialConnections: [],
    nodes,
    onChange: handleConnectionsChange,
  });

  // 当 workflow 加载完成后更新节点和连接
  useEffect(() => {
    if (workflow?.nodes) {
      setNodes(workflow.nodes);
      // TODO: 从 workflow 加载连接数据
      setConnections([]);
    }
  }, [workflow, setNodes, setConnections]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      // 保存节点和连接
      await api.updateWorkflow(id, {
        nodes: nodes as any,
        // 连接数据也需要保存，这里简化处理
      });
      setHasChanges(false);
      // 刷新数据
      refetch();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : '保存失败');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateNode = (updates: Partial<WorkflowNode>) => {
    if (selectedNodeId) {
      updateNode(selectedNodeId, updates);
    }
  };

  const handleDeleteNode = () => {
    if (selectedNodeId) {
      // 删除节点时同时删除相关连接
      const updatedConnections = removeNodeConnections(selectedNodeId, connections);
      setConnections(updatedConnections);
      deleteNode(selectedNodeId);
    }
  };

  const handleCompleteConnection = useCallback(
    (type: 'sequential' | 'conditional' | 'loop' | 'parallel' | 'subflow', options?: { label?: string; condition?: string; color?: string }) => {
      completeConnection(type, options);
    },
    [completeConnection]
  );

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
              <div className="flex items-center gap-2">
                {hasChanges && (
                  <span className="text-xs text-muted-foreground">有未保存的更改</span>
                )}
                {connections.length > 0 && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <GitBranch className="h-3 w-3" />
                    {connections.length} 个连接
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {saveError && (
              <span className="text-xs text-destructive mr-2">{saveError}</span>
            )}
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
              connections={connections}
              selectedNodeId={selectedNodeId}
              selectedConnectionId={selectedConnectionId}
              isCreatingConnection={isCreating}
              tempConnection={tempConnection}
              onSelectNode={selectNode}
              onSelectConnection={selectConnection}
              onStartConnection={startConnection}
              onCompleteConnection={handleCompleteConnection}
              onCancelConnection={cancelConnection}
              onDeleteConnection={deleteConnection}
              onUpdateConnection={updateConnection}
            />
          </div>

          {/* 右侧：属性编辑器 */}
          <div className="w-80 border-l bg-background overflow-y-auto">
            <NodePropertyEditor
              node={getSelectedNode()}
              connections={connections}
              selectedConnection={getSelectedConnection()}
              onChange={handleUpdateNode}
              onDelete={handleDeleteNode}
              onUpdateConnection={updateConnection}
              onDeleteConnection={deleteConnection}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
