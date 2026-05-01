'use client';

import { useState, useCallback } from 'react';
import { Workflow } from '@/types/workflow';
import { api } from '@/lib/api';

export interface BatchOperationResult {
  success: string[];
  failed: Array<{ id: string; error: string }>;
}

export function useBatchOperations() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<BatchOperationResult | null>(null);

  const reset = useCallback(() => {
    setIsProcessing(false);
    setProgress(0);
    setResult(null);
  }, []);

  const batchDelete = useCallback(async (workflowIds: string[]): Promise<BatchOperationResult> => {
    setIsProcessing(true);
    setProgress(0);
    const success: string[] = [];
    const failed: Array<{ id: string; error: string }> = [];

    for (let i = 0; i < workflowIds.length; i++) {
      const id = workflowIds[i];
      try {
        await api.deleteWorkflow(id);
        success.push(id);
      } catch (err) {
        failed.push({
          id,
          error: err instanceof Error ? err.message : '删除失败',
        });
      }
      setProgress(((i + 1) / workflowIds.length) * 100);
    }

    const result = { success, failed };
    setResult(result);
    setIsProcessing(false);
    return result;
  }, []);

  const batchPublish = useCallback(async (workflowIds: string[]): Promise<BatchOperationResult> => {
    setIsProcessing(true);
    setProgress(0);
    const success: string[] = [];
    const failed: Array<{ id: string; error: string }> = [];

    for (let i = 0; i < workflowIds.length; i++) {
      const id = workflowIds[i];
      try {
        await api.publishWorkflow(id);
        success.push(id);
      } catch (err) {
        failed.push({
          id,
          error: err instanceof Error ? err.message : '发布失败',
        });
      }
      setProgress(((i + 1) / workflowIds.length) * 100);
    }

    const result = { success, failed };
    setResult(result);
    setIsProcessing(false);
    return result;
  }, []);

  const batchUnpublish = useCallback(async (workflowIds: string[]): Promise<BatchOperationResult> => {
    setIsProcessing(true);
    setProgress(0);
    const success: string[] = [];
    const failed: Array<{ id: string; error: string }> = [];

    for (let i = 0; i < workflowIds.length; i++) {
      const id = workflowIds[i];
      try {
        await api.unpublishWorkflow(id);
        success.push(id);
      } catch (err) {
        failed.push({
          id,
          error: err instanceof Error ? err.message : '取消发布失败',
        });
      }
      setProgress(((i + 1) / workflowIds.length) * 100);
    }

    const result = { success, failed };
    setResult(result);
    setIsProcessing(false);
    return result;
  }, []);

  const batchArchive = useCallback(async (workflowIds: string[]): Promise<BatchOperationResult> => {
    setIsProcessing(true);
    setProgress(0);
    const success: string[] = [];
    const failed: Array<{ id: string; error: string }> = [];

    for (let i = 0; i < workflowIds.length; i++) {
      const id = workflowIds[i];
      try {
        await api.archiveWorkflow(id);
        success.push(id);
      } catch (err) {
        failed.push({
          id,
          error: err instanceof Error ? err.message : '归档失败',
        });
      }
      setProgress(((i + 1) / workflowIds.length) * 100);
    }

    const result = { success, failed };
    setResult(result);
    setIsProcessing(false);
    return result;
  }, []);

  return {
    isProcessing,
    progress,
    result,
    batchDelete,
    batchPublish,
    batchUnpublish,
    batchArchive,
    reset,
  };
}
