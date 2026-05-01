'use client';

import { DecisionNode } from '@/types/node';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GitBranch, ArrowRight } from 'lucide-react';

interface ReadonlyDecisionNodeProps {
  node: DecisionNode;
  stepNumber: number;
}

export function ReadonlyDecisionNode({ node, stepNumber }: ReadonlyDecisionNodeProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground mb-1">步骤 {stepNumber}</p>
            <CardTitle>{node.title}</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 判断条件 */}
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm font-medium mb-2">判断条件</p>
          <p className="text-muted-foreground">{node.data.condition}</p>
        </div>

        {/* 分支 */}
        <div className="space-y-3">
          <p className="text-sm font-medium">分支选项</p>
          <div className="space-y-2">
            {node.data.branches.map((branch, index) => (
              <div
                key={branch.id}
                className="flex items-center gap-3 p-3 rounded-lg border"
                style={{ borderLeftColor: branch.color, borderLeftWidth: 4 }}
              >
                <Badge
                  variant="outline"
                  style={{
                    backgroundColor: branch.color,
                    color: '#fff',
                    borderColor: branch.color,
                  }}
                >
                  {branch.label}
                </Badge>
                {branch.condition && (
                  <span className="text-sm text-muted-foreground flex-1">
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
