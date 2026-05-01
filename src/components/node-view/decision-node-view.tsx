'use client';

import { DecisionNode } from '@/types/node';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GitBranch, ArrowRight } from 'lucide-react';

interface DecisionNodeViewProps {
  node: DecisionNode;
  isSelected?: boolean;
  onClick?: () => void;
}

export function DecisionNodeView({ node, isSelected, onClick }: DecisionNodeViewProps) {
  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-primary" />
          <CardTitle className="text-base">{node.title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {/* 判断条件 */}
        <div className="p-3 bg-muted rounded-md">
          <p className="text-sm font-medium mb-1">判断条件</p>
          <p className="text-sm text-muted-foreground">{node.data.condition}</p>
        </div>

        {/* 分支 */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground font-medium">分支选项</p>
          <div className="space-y-2">
            {node.data.branches.map((branch, index) => (
              <div
                key={branch.id}
                className="flex items-center gap-2 p-2 rounded-md border"
                style={{ borderLeftColor: branch.color, borderLeftWidth: 3 }}
              >
                <Badge
                  variant="outline"
                  style={{ backgroundColor: branch.color, color: '#fff', borderColor: branch.color }}
                >
                  {branch.label}
                </Badge>
                {branch.condition && (
                  <span className="text-sm text-muted-foreground flex-1 truncate">
                    {branch.condition}
                  </span>
                )}
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
