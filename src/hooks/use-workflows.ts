'use client';

import { useState, useEffect, useCallback } from 'react';
import { Workflow, WorkflowListItem, WorkflowVersion } from '@/types/workflow';
import { api } from '@/lib/api';

interface UseWorkflowsOptions {
  search?: string;
  status?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export function useWorkflows(options: UseWorkflowsOptions = {}) {
  const [workflows, setWorkflows] = useState<WorkflowListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkflows = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await api.getWorkflows(options);
      setWorkflows(result.workflows);
      setTotal(result.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取工作流失败');
    } finally {
      setIsLoading(false);
    }
  }, [options.search, options.status, options.sort, options.page, options.limit]);

  useEffect(() => {
    fetchWorkflows();
  }, [fetchWorkflows]);

  const deleteWorkflow = async (id: string) => {
    try {
      await api.deleteWorkflow(id);
      await fetchWorkflows();
    } catch (err) {
      throw err;
    }
  };

  return {
    workflows,
    total,
    isLoading,
    error,
    refetch: fetchWorkflows,
    deleteWorkflow
  };
}

export function useWorkflow(id: string) {
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkflow = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await api.getWorkflow(id);
        setWorkflow(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取工作流详情失败');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchWorkflow();
    }
  }, [id]);

  return { workflow, isLoading, error };
}

export function useCreateWorkflow() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (data: { title: string; description?: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await api.createWorkflow(data);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建工作流失败');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { create, isLoading, error };
}

export function useVersions(workflowId: string) {
  const [versions, setVersions] = useState<WorkflowVersion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVersions = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await api.getVersions(workflowId);
        setVersions(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取版本历史失败');
      } finally {
        setIsLoading(false);
      }
    };

    if (workflowId) {
      fetchVersions();
    }
  }, [workflowId]);

  const rollback = async (versionId: string) => {
    try {
      await api.rollbackVersion(workflowId, versionId);
      // 重新获取版本列表
      const result = await api.getVersions(workflowId);
      setVersions(result);
    } catch (err) {
      throw err;
    }
  };

  return { versions, isLoading, error, rollback };
}
