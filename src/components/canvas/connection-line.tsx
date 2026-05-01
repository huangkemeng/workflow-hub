'use client';

import { Connection, ConnectionType } from '@/types/connection';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface ConnectionLineProps {
  connection: Connection;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  isSelected?: boolean;
  isTemp?: boolean;
  onClick?: () => void;
  onDelete?: () => void;
}

export function ConnectionLine({
  connection,
  sourceX,
  sourceY,
  targetX,
  targetY,
  isSelected,
  isTemp,
  onClick,
  onDelete,
}: ConnectionLineProps) {
  const color = connection.style?.color || '#6b7280';
  const lineStyle = connection.style?.lineStyle || 'solid';

  // 计算控制点（使用贝塞尔曲线）
  const deltaY = targetY - sourceY;
  const controlPointOffset = Math.abs(deltaY) * 0.5;

  const path = `M ${sourceX} ${sourceY} 
                C ${sourceX} ${sourceY + controlPointOffset},
                  ${targetX} ${targetY - controlPointOffset},
                  ${targetX} ${targetY}`;

  const strokeDasharray = {
    solid: 'none',
    dashed: '5,5',
    dotted: '2,2',
  }[lineStyle];

  // 计算标签位置（中点）
  const midX = (sourceX + targetX) / 2;
  const midY = (sourceY + targetY) / 2;

  return (
    <g
      className={cn(
        'cursor-pointer transition-opacity',
        isTemp && 'opacity-50',
        isSelected && 'opacity-100'
      )}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
    >
      {/* 隐形宽线用于更容易点击 */}
      <path
        d={path}
        stroke="transparent"
        strokeWidth={20}
        fill="none"
        className="cursor-pointer"
      />

      {/* 可见的连接线 */}
      <path
        d={path}
        stroke={color}
        strokeWidth={isSelected ? 3 : 2}
        fill="none"
        strokeDasharray={strokeDasharray}
        markerEnd="url(#arrowhead)"
        className={cn(
          'transition-all',
          isSelected && 'drop-shadow-md'
        )}
      />

      {/* 标签 */}
      {connection.label && (
        <g>
          <rect
            x={midX - 30}
            y={midY - 12}
            width={60}
            height={24}
            rx={4}
            fill="white"
            stroke={color}
            strokeWidth={1}
          />
          <text
            x={midX}
            y={midY + 4}
            textAnchor="middle"
            className="text-xs fill-current"
            style={{ fontSize: '12px' }}
          >
            {connection.label}
          </text>
        </g>
      )}

      {/* 删除按钮 */}
      {isSelected && onDelete && (
        <g
          transform={`translate(${midX + 35}, ${midY - 10})`}
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="cursor-pointer"
        >
          <circle
            r={10}
            fill="#ef4444"
            className="hover:fill-red-600 transition-colors"
          />
          <text
            x={0}
            y={4}
            textAnchor="middle"
            className="fill-white text-xs"
            style={{ fontSize: '12px' }}
          >
            ×
          </text>
        </g>
      )}
    </g>
  );
}

// SVG 箭头标记定义
export function ArrowMarker() {
  return (
    <defs>
      <marker
        id="arrowhead"
        markerWidth="10"
        markerHeight="7"
        refX="9"
        refY="3.5"
        orient="auto"
      >
        <polygon
          points="0 0, 10 3.5, 0 7"
          fill="#6b7280"
        />
      </marker>
    </defs>
  );
}

// 临时连接线（拖拽中）
interface TempConnectionLineProps {
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  isValid?: boolean;
}

export function TempConnectionLine({
  sourceX,
  sourceY,
  targetX,
  targetY,
  isValid = true,
}: TempConnectionLineProps) {
  const path = `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;

  return (
    <path
      d={path}
      stroke={isValid ? '#3b82f6' : '#ef4444'}
      strokeWidth={2}
      strokeDasharray="5,5"
      fill="none"
      className="pointer-events-none"
    />
  );
}

// 连接类型选择器
interface ConnectionTypeSelectorProps {
  onSelect: (type: ConnectionType) => void;
  onCancel: () => void;
}

export function ConnectionTypeSelector({
  onSelect,
  onCancel,
}: ConnectionTypeSelectorProps) {
  const types: { type: ConnectionType; label: string; color: string }[] = [
    { type: 'sequential', label: '顺序', color: '#6b7280' },
    { type: 'conditional', label: '条件', color: '#3b82f6' },
    { type: 'loop', label: '循环', color: '#f59e0b' },
    { type: 'parallel', label: '并行', color: '#10b981' },
  ];

  return (
    <div className="absolute z-50 bg-white rounded-lg shadow-lg border p-3 min-w-[150px]">
      <p className="text-sm font-medium mb-2">选择连接类型</p>
      <div className="space-y-1">
        {types.map(({ type, label, color }) => (
          <button
            key={type}
            onClick={() => onSelect(type)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 text-left text-sm"
          >
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: color }}
            />
            {label}
          </button>
        ))}
      </div>
      <button
        onClick={onCancel}
        className="w-full mt-2 px-3 py-1 text-xs text-gray-500 hover:text-gray-700"
      >
        取消
      </button>
    </div>
  );
}
