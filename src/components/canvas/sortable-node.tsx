'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { GripVertical } from 'lucide-react';

interface SortableNodeProps {
  id: string;
  children: ReactNode;
  isSelected?: boolean;
  isDisabled?: boolean;
}

export function SortableNode({ id, children, isSelected, isDisabled }: SortableNodeProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: isDisabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative group',
        isDragging && 'opacity-50',
        isSelected && 'z-10'
      )}
    >
      {/* 拖拽手柄 - 只有手柄可以触发拖拽 */}
      <div
        {...attributes}
        {...listeners}
        className={cn(
          'absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full pr-2',
          'opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing',
          isDragging && 'opacity-100 cursor-grabbing'
        )}
      >
        <div className="p-1 rounded bg-muted hover:bg-muted-foreground/20">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      {/* 节点内容 - 点击事件正常传播 */}
      <div className="relative">
        {children}
      </div>
    </div>
  );
}
