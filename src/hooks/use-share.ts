'use client';

import { useState, useCallback } from 'react';
import { ShareLink, CreateShareRequest } from '@/types/share';
import { api } from '@/lib/api';

interface UseShareOptions {
  workflowId: string;
}

export function useShare({ workflowId }: UseShareOptions) {
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchShareLinks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getShares(workflowId);
      setShareLinks(data);
    } catch (err) {
      setError('获取分享链接失败');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [workflowId]);

  const createShare = useCallback(async (data: CreateShareRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await api.createShare(workflowId, data);
      setShareLinks(prev => [result, ...prev]);
      return result;
    } catch (err) {
      setError('创建分享链接失败');
      console.error(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [workflowId]);

  const revokeShare = useCallback(async (shareId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await api.revokeShare(workflowId, shareId);
      setShareLinks(prev => prev.filter(link => link.id !== shareId));
    } catch (err) {
      setError('撤销分享失败');
      console.error(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [workflowId]);

  return {
    shareLinks,
    isLoading,
    error,
    fetchShareLinks,
    createShare,
    revokeShare,
  };
}

export function useSharedWorkflow(token: string) {
  const [workflow, setWorkflow] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSharedWorkflow = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getSharedWorkflow(token);
      setWorkflow(data);
    } catch (err: any) {
      if (err.message?.includes('404')) {
        setError('分享链接不存在或已过期');
      } else {
        setError('加载分享内容失败');
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  return {
    workflow,
    isLoading,
    error,
    fetchSharedWorkflow,
  };
}
