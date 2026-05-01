'use client';

import { NoteNode } from '@/types/node';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, AlertTriangle, CheckCircle, XCircle, Lightbulb } from 'lucide-react';

interface ReadonlyNoteNodeProps {
  node: NoteNode;
  stepNumber: number;
}

const noteTypeConfig = {
  info: {
    icon: Info,
    color: 'bg-blue-50 border-blue-200 text-blue-900',
    iconColor: 'text-blue-500',
    label: '信息',
  },
  warning: {
    icon: AlertTriangle,
    color: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    iconColor: 'text-yellow-600',
    label: '警告',
  },
  success: {
    icon: CheckCircle,
    color: 'bg-green-50 border-green-200 text-green-900',
    iconColor: 'text-green-500',
    label: '成功',
  },
  error: {
    icon: XCircle,
    color: 'bg-red-50 border-red-200 text-red-900',
    iconColor: 'text-red-500',
    label: '错误',
  },
  tip: {
    icon: Lightbulb,
    color: 'bg-purple-50 border-purple-200 text-purple-900',
    iconColor: 'text-purple-500',
    label: '提示',
  },
};

export function ReadonlyNoteNode({ node, stepNumber }: ReadonlyNoteNodeProps) {
  const config = noteTypeConfig[node.data.noteType];
  const Icon = config.icon;

  return (
    <Card className={config.color}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Icon className={`h-5 w-5 ${config.iconColor}`} />
          <div>
            <p className="text-sm opacity-70 mb-1">步骤 {stepNumber} · {config.label}</p>
            <CardTitle className="text-lg">{node.title}</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div
          className="prose prose-sm max-w-none opacity-90"
          dangerouslySetInnerHTML={{ __html: node.data.content }}
        />
      </CardContent>
    </Card>
  );
}
