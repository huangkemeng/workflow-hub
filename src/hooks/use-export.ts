'use client';

import { useState, useCallback } from 'react';
import { Workflow } from '@/types/workflow';
import { downloadMarkdown } from '@/lib/export-markdown';

type ExportFormat = 'markdown';

interface UseExportOptions {
  workflow: Workflow;
}

export function useExport({ workflow }: UseExportOptions) {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportWorkflow = useCallback(async (format: ExportFormat) => {
    setIsExporting(true);
    setError(null);
    
    try {
      switch (format) {
        case 'markdown':
          downloadMarkdown(workflow);
          break;
        default:
          throw new Error(`不支持的导出格式: ${format}`);
      }
    } catch (err) {
      setError('导出失败');
      console.error(err);
      throw err;
    } finally {
      setIsExporting(false);
    }
  }, [workflow]);

  return {
    isExporting,
    error,
    exportWorkflow,
  };
}
