'use client';

import { WorkflowNode } from '@/types/node';
import { Connection } from '@/types/connection';
import { StandardNodeForm } from './standard-node-form';
import { DecisionNodeForm } from './decision-node-form';
import { NoteNodeForm } from './note-node-form';
import { SubflowNodeForm } from './subflow-node-form';
import { ConnectionEditor } from './connection-editor';
import { Button } from '@/components/ui/button';
import { Trash2, GitBranch } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getNodeConnections } from '@/lib/connection-utils';

interface NodePropertyEditorProps {
  node: WorkflowNode | null;
  connections: Connection[];
  selectedConnection: Connection | null;
  onChange: (updates: Partial<WorkflowNode>) => void;
  onDelete: () => void;
  onUpdateConnection: (connectionId: string, updates: Partial<Connection>) => void;
  onDeleteConnection: (connectionId: string) => void;
}

export function NodePropertyEditor({
  node,
  connections,
  selectedConnection,
  onChange,
  onDelete,
  onUpdateConnection,
  onDeleteConnection,
}: NodePropertyEditorProps) {
  // 如果有选中的连接，显示连接编辑器
  if (selectedConnection) {
    return (
      <div className="p-4">
        <ConnectionEditor
          connection={selectedConnection}
          onUpdate={(updates) => onUpdateConnection(selectedConnection.id, updates)}
          onDelete={() => onDeleteConnection(selectedConnection.id)}
        />
      </div>
    );
  }

  if (!node) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <p>选择一个节点或连接进行编辑</p>
        <p className="text-xs mt-2">点击节点查看属性，点击连接线编辑连接</p>
      </div>
    );
  }

  const nodeConnections = getNodeConnections(node.id, connections);

  const renderForm = () => {
    switch (node.type) {
      case 'standard':
        return (
          <StandardNodeForm
            node={node}
            onChange={onChange as any}
          />
        );
      case 'decision':
        return (
          <DecisionNodeForm
            node={node}
            onChange={onChange as any}
          />
        );
      case 'note':
        return (
          <NoteNodeForm
            node={node}
            onChange={onChange as any}
          />
        );
      case 'subflow':
        return (
          <SubflowNodeForm
            currentWorkflowId="temp-workflow-id"
            data={node.data}
            onChange={(data) => onChange({ data })}
          />
        );
      default:
        return (
          <div className="p-4 text-center text-muted-foreground">
            <p>该节点类型暂不支持详细编辑</p>
            <p className="text-xs mt-2">基本属性可在下方修改</p>
          </div>
        );
    }
  };

  return (
    <Tabs defaultValue="properties" className="w-full">
      <TabsList className="w-full grid grid-cols-2">
        <TabsTrigger value="properties">属性</TabsTrigger>
        <TabsTrigger value="connections">
          连接
          {nodeConnections.incoming.length + nodeConnections.outgoing.length > 0 && (
            <span className="ml-1 text-xs bg-primary text-primary-foreground rounded-full px-1.5">
              {nodeConnections.incoming.length + nodeConnections.outgoing.length}
            </span>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="properties" className="mt-4">
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{node.title || '未命名节点'}</h3>
              <p className="text-xs text-muted-foreground">类型: {node.type}</p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>确认删除</AlertDialogTitle>
                  <AlertDialogDescription>
                    确定要删除这个节点吗？相关的连接也会被删除，此操作无法撤销。
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>取消</AlertDialogCancel>
                  <AlertDialogAction onClick={onDelete} className="bg-destructive">
                    删除
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          {renderForm()}
        </div>
      </TabsContent>

      <TabsContent value="connections" className="mt-4">
        <div className="p-4 space-y-4">
          {/* 入连接 */}
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <GitBranch className="h-4 w-4 rotate-180" />
              入连接 ({nodeConnections.incoming.length})
            </h4>
            {nodeConnections.incoming.length === 0 ? (
              <p className="text-xs text-muted-foreground">没有入连接</p>
            ) : (
              <div className="space-y-2">
                {nodeConnections.incoming.map((conn) => (
                  <div
                    key={conn.id}
                    className="p-2 rounded border text-sm"
                    style={{ borderLeftColor: conn.style?.color, borderLeftWidth: 3 }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate">来自: {conn.source}</span>
                      <span className="text-xs text-muted-foreground">{conn.label}</span>
                    </div>
                    {conn.condition && (
                      <p className="text-xs text-muted-foreground mt-1">条件: {conn.condition}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 出连接 */}
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <GitBranch className="h-4 w-4" />
              出连接 ({nodeConnections.outgoing.length})
            </h4>
            {nodeConnections.outgoing.length === 0 ? (
              <p className="text-xs text-muted-foreground">没有出连接</p>
            ) : (
              <div className="space-y-2">
                {nodeConnections.outgoing.map((conn) => (
                  <div
                    key={conn.id}
                    className="p-2 rounded border text-sm cursor-pointer hover:bg-muted transition-colors"
                    style={{ borderLeftColor: conn.style?.color, borderLeftWidth: 3 }}
                    onClick={() => onUpdateConnection(conn.id, {})}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate">到: {conn.target}</span>
                      <span className="text-xs text-muted-foreground">{conn.label}</span>
                    </div>
                    {conn.condition && (
                      <p className="text-xs text-muted-foreground mt-1">条件: {conn.condition}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              提示: 点击节点右侧的 + 按钮创建新连接
            </p>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}
