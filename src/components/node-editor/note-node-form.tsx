'use client';

import { NoteNode } from '@/types/node';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface NoteNodeFormProps {
  node: NoteNode;
  onChange: (updates: Partial<NoteNode>) => void;
}

export function NoteNodeForm({ node, onChange }: NoteNodeFormProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>备注标题</Label>
        <Input
          value={node.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="输入备注标题"
        />
      </div>

      <div className="space-y-2">
        <Label>备注类型</Label>
        <Select
          value={node.data.noteType}
          onValueChange={(value) =>
            onChange({
              data: { ...node.data, noteType: value as any },
            })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="info">信息</SelectItem>
            <SelectItem value="warning">警告</SelectItem>
            <SelectItem value="success">成功</SelectItem>
            <SelectItem value="error">错误</SelectItem>
            <SelectItem value="tip">提示</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>备注内容</Label>
        <Textarea
          value={node.data.content}
          onChange={(e) =>
            onChange({
              data: { ...node.data, content: e.target.value },
            })
          }
          placeholder="输入备注内容"
          rows={6}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="collapsible"
          checked={node.data.isCollapsible}
          onCheckedChange={(checked) =>
            onChange({
              data: { ...node.data, isCollapsible: checked as boolean },
            })
          }
        />
        <Label htmlFor="collapsible" className="text-sm font-normal">
          允许折叠
        </Label>
      </div>

      {node.data.isCollapsible && (
        <div className="flex items-center space-x-2">
          <Checkbox
            id="defaultCollapsed"
            checked={node.data.defaultCollapsed}
            onCheckedChange={(checked) =>
              onChange({
                data: { ...node.data, defaultCollapsed: checked as boolean },
              })
              }
          />
          <Label htmlFor="defaultCollapsed" className="text-sm font-normal">
            默认折叠
          </Label>
        </div>
      )}
    </div>
  );
}
