'use client';

import { useState, useCallback, useEffect } from 'react';
import { api } from '@/lib/api';

export interface ShareStats {
  totalShares: number;
  activeShares: number;
  expiredShares: number;
  totalAccessCount: number;
  sharesByWorkflow: Array<{
    workflowId: string;
    workflowTitle: string;
    shareCount: number;
    totalAccess: number;
  }>;
  recentAccess: Array<{
    shareId: string;
    workflowTitle: string;
    accessedAt: string;
    ip?: string;
  }>;
}

export function useShareStats() {
  const [stats, setStats] = useState<ShareStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 这里应该调用实际的 API
      // const data = await api.getShareStats();
      // 模拟数据
      const mockData: ShareStats = {
        totalShares: 12,
        activeShares: 8,
        expiredShares: 4,
        totalAccessCount: 156,
        sharesByWorkflow: [
          { workflowId: '1', workflowTitle: '产品发布流程', shareCount: 3, totalAccess: 45 },
          { workflowId: '2', workflowTitle: 'bug修复流程', shareCount: 2, totalAccess: 32 },
          { workflowId: '3', workflowTitle: '用户反馈处理', shareCount: 1, totalAccess: 18 },
        ],
        recentAccess: [
          { shareId: '1', workflowTitle: '产品发布流程', accessedAt: new Date().toISOString() },
          { shareId: '2', workflowTitle: 'bug修复流程', accessedAt: new Date(Date.now() - 3600000).toISOString() },
        ],
      };
      setStats(mockData);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取分享统计失败');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    isLoading,
    error,
    refetch: fetchStats,
  };
}
