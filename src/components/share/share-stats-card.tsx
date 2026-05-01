'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShareStats } from '@/hooks/use-share-stats';
import { Share2, Eye, Clock, CheckCircle2, BarChart3 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface ShareStatsCardProps {
  stats: ShareStats | null;
  isLoading?: boolean;
}

export function ShareStatsCard({ stats, isLoading }: ShareStatsCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            分享统计
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            分享统计
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            暂无分享统计数据
          </p>
        </CardContent>
      </Card>
    );
  }

  const statItems = [
    {
      icon: Share2,
      label: '总分享数',
      value: stats.totalShares,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: CheckCircle2,
      label: '有效分享',
      value: stats.activeShares,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      icon: Clock,
      label: '已过期',
      value: stats.expiredShares,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      icon: Eye,
      label: '总访问数',
      value: stats.totalAccessCount,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          分享统计
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 统计概览 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statItems.map((item) => (
            <div
              key={item.label}
              className={`${item.bgColor} rounded-lg p-4 text-center`}
            >
              <div className={`flex justify-center mb-2 ${item.color}`}>
                <item.icon className="h-6 w-6" />
              </div>
              <p className="text-2xl font-bold">{item.value}</p>
              <p className="text-xs text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>

        {/* 按工作流统计 */}
        {stats.sharesByWorkflow.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm">工作流分享排行</h4>
            <div className="space-y-2">
              {stats.sharesByWorkflow.map((item, index) => (
                <div
                  key={item.workflowId}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-muted-foreground w-6">
                      {index + 1}
                    </span>
                    <span className="font-medium">{item.workflowTitle}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Share2 className="h-3 w-3" />
                      {item.shareCount}
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Eye className="h-3 w-3" />
                      {item.totalAccess}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 最近访问 */}
        {stats.recentAccess.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm">最近访问</h4>
            <div className="space-y-2">
              {stats.recentAccess.slice(0, 5).map((access, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 text-sm"
                >
                  <span className="truncate flex-1">{access.workflowTitle}</span>
                  <Badge variant="secondary" className="text-xs shrink-0">
                    {formatDistanceToNow(new Date(access.accessedAt), {
                      addSuffix: true,
                      locale: zhCN,
                    })}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
