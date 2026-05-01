'use client';

import { StandardNode } from '@/types/node';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, FileText, Tag } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

interface StandardNodeViewProps {
  node: StandardNode;
  isSelected?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

const statusMap = {
  pending: { label: '待处理', variant: 'secondary' as const },
  'in-progress': { label: '进行中', variant: 'default' as const },
  completed: { label: '已完成', variant: 'default' as const },
  skipped: { label: '已跳过', variant: 'outline' as const },
};

export function StandardNodeView({ node, isSelected, onClick }: StandardNodeViewProps) {
  const status = node.data.status ? statusMap[node.data.status] : null;

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}
      style={{ borderLeftColor: node.config?.color, borderLeftWidth: 4 }}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base">{node.title}</CardTitle>
          {status && <Badge variant={status.variant}>{status.label}</Badge>}
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        {/* 人物 */}
        {node.data.characters && node.data.characters.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{node.data.characters.join(', ')}</span>
          </div>
        )}

        {/* 时间和地点 */}
        {(node.data.scheduledAt || node.data.location) && (
          <div className="flex flex-wrap gap-3">
            {node.data.scheduledAt && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{formatDateTime(node.data.scheduledAt)}</span>
              </div>
            )}
            {node.data.location && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{node.data.location}</span>
              </div>
            )}
          </div>
        )}

        {/* 事件内容 */}
        {node.data.event?.content && (
          <div className="flex items-start gap-2 text-sm">
            <FileText className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <p className="line-clamp-3 text-muted-foreground">
              {node.data.event.content}
            </p>
          </div>
        )}

        {/* 标签 */}
        {node.data.tags && node.data.tags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <Tag className="h-4 w-4 text-muted-foreground" />
            {node.data.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
