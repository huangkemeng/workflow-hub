'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileText, Download, Loader2 } from 'lucide-react';
import { useExport } from '@/hooks/use-export';
import { Workflow } from '@/types/workflow';

interface ExportModalProps {
  workflow: Workflow;
  isOpen: boolean;
  onClose: () => void;
}

export function ExportModal({ workflow, isOpen, onClose }: ExportModalProps) {
  const { isExporting, exportWorkflow } = useExport({ workflow });

  const handleExport = async (format: 'markdown') => {
    try {
      await exportWorkflow(format);
      onClose();
    } catch (err) {
      // Error handled in hook
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>导出工作流</DialogTitle>
          <DialogDescription>
            选择导出格式，将工作流导出为文件
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start h-auto p-4"
            onClick={() => handleExport('markdown')}
            disabled={isExporting}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 mr-4">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium">Markdown</p>
              <p className="text-sm text-muted-foreground">
                导出为 Markdown 格式，适合文档编辑和分享
              </p>
            </div>
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
