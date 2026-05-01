'use client';

import { NodeType } from '@/types/node';
import { getNodeTypeLabel, getNodeTypeDescription, getNodeTypeIcon } from '@/lib/node-utils';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, GitBranch, Layers, RefreshCw, Workflow, StickyNote, Plus } from 'lucide-react';

interface NodeTypeSelectorProps {
  onSelect: (type: NodeType) => void;
}

const nodeTypes: NodeType[] = ['standard', 'decision', 'parallel', 'loop', 'subflow', 'note'];

const iconMap = {
  FileText,
  GitBranch,
  Layers,
  RefreshCw,
  Workflow,
  StickyNote,
};

export function NodeTypeSelector({ onSelect }: NodeTypeSelectorProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-sm">添加节点</h3>
      <div className="grid grid-cols-1 gap-2">
        {nodeTypes.map((type) => {
          const iconName = getNodeTypeIcon(type);
          const Icon = iconMap[iconName as keyof typeof iconMap];
          
          return (
            <Card
              key={type}
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => onSelect(type)}
            >
              <CardContent className="p-3 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{getNodeTypeLabel(type)}</span>
                    <Plus className="h-3 w-3 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {getNodeTypeDescription(type)}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
