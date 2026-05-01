'use client';

import { useState, useCallback } from 'react';
import { Workflow, WorkflowStatus } from '@/types/workflow';
import { api } from '@/lib/api';

interface UseWorkflowStatusProps {
  workflowId: string;
  initialStatus: WorkflowStatus;
  onStatusChange?: (status: WorkflowStatus) => void;
}

export function useWorkflowStatus({
  workflowId,
  initialStatus,
  onStatusChange,
}: UseWorkflowStatusProps) {
  const [status, setStatus] = useState<WorkflowStatus>(initialStatus);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 发布工作流
  const publish = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await api.publishWorkflow(workflowId);
      setStatus('PUBLISHED');
      onStatusChange?.('PUBLISHED');
    } catch (err) {
      setError(err instanceof Error ? err.message : '发布失败');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [workflowId, onStatusChange]);

  // 取消发布
  const unpublish = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await api.unpublishWorkflow(workflowId);
      setStatus('DRAFT');
      onStatusChange?.('DRAFT');
    } catch (err) {
      setError(err instanceof Error ? err.message : '取消发布失败');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [workflowId, onStatusChange]);

  // 归档工作流
  const archive = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await api.archiveWorkflow(workflowId);
      setStatus('ARCHIVED');
      onStatusChange?.('ARCHIVED');
    } catch (err) {
      setError(err instanceof Error ? err.message : '归档失败');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [workflowId, onStatusChange]);

  // 恢复工作流
  const restore = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await api.restoreWorkflow(workflowId);
      setStatus('DRAFT');
      onStatusChange?.('DRAFT');
    } catch (err) {
      setError(err instanceof Error ? err.message : '恢复失败');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [workflowId, onStatusChange]);

  return {
    status,
    isLoading,
    error,
    publish,
    unpublish,
    archive,
    restore,
  };
}
