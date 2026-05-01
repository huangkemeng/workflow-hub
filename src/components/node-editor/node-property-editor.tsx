'use client';

import { WorkflowNode } from '@/types/node';
import { StandardNodeForm } from './standard-node-form';
import { DecisionNodeForm } from './decision-node-form';
import { NoteNodeForm } from './note-node-form';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
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

interface NodePropertyEditorProps {
  node: WorkflowNode | null;
  onChange: (updates: Partial<WorkflowNode>) => void;
  onDelete: () => void;
}

export function NodePropertyEditor({ node, onChange, onDelete }: NodePropertyEditorProps) {
  if (!node) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <p>选择一个节点进行编辑</p>
      </div>
    );
  }

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
      default:
        return (
          <div className="p-4 text-center text-muted-foreground">
            <p>该节点类型暂不支持编辑</p>
          </div>
        );
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">节点属性</h3>
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
                确定要删除这个节点吗？此操作无法撤销。
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
  );
}
