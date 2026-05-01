'use client';

import { useState, useEffect } from 'react';
import { StandardNode } from '@/types/node';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X, Plus } from 'lucide-react';

interface StandardNodeFormProps {
  node: StandardNode;
  onChange: (updates: Partial<StandardNode>) => void;
}

export function StandardNodeForm({ node, onChange }: StandardNodeFormProps) {
  const [newCharacter, setNewCharacter] = useState('');
  const [newTag, setNewTag] = useState('');

  const addCharacter = () => {
    if (newCharacter.trim()) {
      onChange({
        data: {
          ...node.data,
          characters: [...(node.data.characters || []), newCharacter.trim()],
        },
      });
      setNewCharacter('');
    }
  };

  const removeCharacter = (index: number) => {
    const newCharacters = [...(node.data.characters || [])];
    newCharacters.splice(index, 1);
    onChange({
      data: { ...node.data, characters: newCharacters },
    });
  };

  const addTag = () => {
    if (newTag.trim()) {
      onChange({
        data: {
          ...node.data,
          tags: [...(node.data.tags || []), newTag.trim()],
        },
      });
      setNewTag('');
    }
  };

  const removeTag = (index: number) => {
    const newTags = [...(node.data.tags || [])];
    newTags.splice(index, 1);
    onChange({
      data: { ...node.data, tags: newTags },
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>节点标题</Label>
        <Input
          value={node.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="输入节点标题"
        />
      </div>

      <div className="space-y-2">
        <Label>参与人物</Label>
        <div className="flex gap-2">
          <Input
            value={newCharacter}
            onChange={(e) => setNewCharacter(e.target.value)}
            placeholder="添加人物"
            onKeyDown={(e) => e.key === 'Enter' && addCharacter()}
          />
          <Button type="button" onClick={addCharacter} size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {node.data.characters?.map((char, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1">
              {char}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => removeCharacter(index)}
              />
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>计划时间</Label>
        <Input
          type="datetime-local"
          value={node.data.scheduledAt ? node.data.scheduledAt.slice(0, 16) : ''}
          onChange={(e) =>
            onChange({
              data: { ...node.data, scheduledAt: e.target.value },
            })
          }
        />
      </div>

      <div className="space-y-2">
        <Label>地点</Label>
        <Input
          value={node.data.location || ''}
          onChange={(e) =>
            onChange({
              data: { ...node.data, location: e.target.value },
            })
          }
          placeholder="输入地点"
        />
      </div>

      <div className="space-y-2">
        <Label>事件内容</Label>
        <Textarea
          value={node.data.event?.content || ''}
          onChange={(e) =>
            onChange({
              data: {
                ...node.data,
                event: { 
                  content: e.target.value,
                  format: node.data.event?.format || 'rich-text'
                },
              },
            })
          }
          placeholder="输入事件内容"
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label>状态</Label>
        <Select
          value={node.data.status || 'pending'}
          onValueChange={(value) =>
            onChange({
              data: { ...node.data, status: value as any },
            })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">待处理</SelectItem>
            <SelectItem value="in-progress">进行中</SelectItem>
            <SelectItem value="completed">已完成</SelectItem>
            <SelectItem value="skipped">已跳过</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>标签</Label>
        <div className="flex gap-2">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="添加标签"
            onKeyDown={(e) => e.key === 'Enter' && addTag()}
          />
          <Button type="button" onClick={addTag} size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {node.data.tags?.map((tag, index) => (
            <Badge key={index} variant="outline" className="flex items-center gap-1">
              {tag}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => removeTag(index)}
              />
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
