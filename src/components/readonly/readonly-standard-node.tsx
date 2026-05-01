'use client';

import { StandardNode } from '@/types/node';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, FileText, Tag } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

interface ReadonlyStandardNodeProps {
  node: StandardNode;
  stepNumber: number;
}

const statusMap = {
  pending: { label: '待处理', variant: 'secondary' as const },
  'in-progress': { label: '进行中', variant: 'default' as const },
  completed: { label: '已完成', variant: 'default' as const },
  skipped: { label: '已跳过', variant: 'outline' as const },
};

export function ReadonlyStandardNode({ node, stepNumber }: ReadonlyStandardNodeProps) {
  const status = node.data.status ? statusMap[node.data.status] : null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">步骤 {stepNumber}</p>
            <CardTitle>{node.title}</CardTitle>
          </div>
          {status && <Badge variant={status.variant}>{status.label}</Badge>}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 人物 */}
        {node.data.characters && node.data.characters.length > 0 && (
          <div className="flex items-start gap-2">
            <Users className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">参与人物</p>
              <p className="text-sm text-muted-foreground">
                {node.data.characters.join(', ')}
              </p>
            </div>
          </div>
        )}

        {/* 时间和地点 */}
        {(node.data.scheduledAt || node.data.location) && (
          <div className="flex flex-wrap gap-4">
            {node.data.scheduledAt && (
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">计划时间</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDateTime(node.data.scheduledAt)}
                  </p>
                </div>
              </div>
            )}
            {node.data.location && (
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">地点</p>
                  <p className="text-sm text-muted-foreground">
                    {node.data.location}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 事件内容 */}
        {node.data.event?.content && (
          <div className="flex items-start gap-2">
            <FileText className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm font-medium">事件内容</p>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {node.data.event.content}
              </p>
            </div>
          </div>
        )}

        {/* 标签 */}
        {node.data.tags && node.data.tags.length > 0 && (
          <div className="flex items-start gap-2">
            <Tag className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <div className="flex flex-wrap gap-2">
              {node.data.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
