'use client';

import { NoteNode } from '@/types/node';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StickyNote, Info, AlertTriangle, CheckCircle, XCircle, Lightbulb } from 'lucide-react';

interface NoteNodeViewProps {
  node: NoteNode;
  isSelected?: boolean;
  onClick?: () => void;
}

const noteTypeConfig = {
  info: {
    icon: Info,
    color: 'bg-blue-50 border-blue-200',
    iconColor: 'text-blue-500',
  },
  warning: {
    icon: AlertTriangle,
    color: 'bg-yellow-50 border-yellow-200',
    iconColor: 'text-yellow-600',
  },
  success: {
    icon: CheckCircle,
    color: 'bg-green-50 border-green-200',
    iconColor: 'text-green-500',
  },
  error: {
    icon: XCircle,
    color: 'bg-red-50 border-red-200',
    iconColor: 'text-red-500',
  },
  tip: {
    icon: Lightbulb,
    color: 'bg-purple-50 border-purple-200',
    iconColor: 'text-purple-500',
  },
};

export function NoteNodeView({ node, isSelected, onClick }: NoteNodeViewProps) {
  const config = noteTypeConfig[node.data.noteType];
  const Icon = config.icon;

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${config.color} ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Icon className={`h-5 w-5 ${config.iconColor}`} />
          <CardTitle className="text-base">{node.title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div 
          className="text-sm prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: node.data.content }}
        />
      </CardContent>
    </Card>
  );
}
