'use client';

import { Connection, ConnectionType } from '@/types/connection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getConnectionTypeLabel } from '@/lib/connection-utils';

interface ConnectionEditorProps {
  connection: Connection;
  onUpdate: (updates: Partial<Connection>) => void;
  onDelete: () => void;
}

export function ConnectionEditor({
  connection,
  onUpdate,
  onDelete,
}: ConnectionEditorProps) {
  const connectionTypes: ConnectionType[] = ['sequential', 'conditional', 'loop', 'parallel', 'subflow'];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">编辑连接</h3>
        <Button variant="destructive" size="sm" onClick={onDelete}>
          删除连接
        </Button>
      </div>

      <div className="space-y-2">
        <Label>连接类型</Label>
        <Select
          value={connection.type}
          onValueChange={(value) => onUpdate({ type: value as ConnectionType })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {connectionTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {getConnectionTypeLabel(type)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>标签</Label>
        <Input
          value={connection.label || ''}
          onChange={(e) => onUpdate({ label: e.target.value })}
          placeholder="例如：通过、不通过"
        />
      </div>

      {connection.type === 'conditional' && (
        <div className="space-y-2">
          <Label>条件描述</Label>
          <Input
            value={connection.condition || ''}
            onChange={(e) => onUpdate({ condition: e.target.value })}
            placeholder="例如：评分 >= 80"
          />
        </div>
      )}

      <div className="space-y-2">
        <Label>线条颜色</Label>
        <div className="flex gap-2">
          {['#6b7280', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'].map((color) => (
            <button
              key={color}
              onClick={() => onUpdate({ style: { ...connection.style, color } })}
              className={`w-8 h-8 rounded-full border-2 ${
                connection.style?.color === color ? 'border-gray-900' : 'border-transparent'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>线条样式</Label>
        <Select
          value={connection.style?.lineStyle || 'solid'}
          onValueChange={(value) =>
            onUpdate({
              style: {
                ...connection.style,
                lineStyle: value as 'solid' | 'dashed' | 'dotted',
              },
            })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="solid">实线</SelectItem>
            <SelectItem value="dashed">虚线</SelectItem>
            <SelectItem value="dotted">点线</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="pt-4 border-t">
        <div className="text-xs text-muted-foreground space-y-1">
          <p>源节点: {connection.source}</p>
          <p>目标节点: {connection.target}</p>
          <p>
            创建时间:{' '}
            {connection.metadata?.createdAt
              ? new Date(connection.metadata.createdAt).toLocaleString()
              : '未知'}
          </p>
        </div>
      </div>
    </div>
  );
}
