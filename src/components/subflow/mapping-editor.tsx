'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, ArrowRight } from 'lucide-react';

export interface ParameterMapping {
  id: string;
  sourceField: string;
  targetField: string;
  description?: string;
}

interface MappingEditorProps {
  title: string;
  description?: string;
  mappings: ParameterMapping[];
  availableSourceFields: string[];
  availableTargetFields: string[];
  onChange: (mappings: ParameterMapping[]) => void;
}

export function MappingEditor({
  title,
  description,
  mappings,
  availableSourceFields,
  availableTargetFields,
  onChange,
}: MappingEditorProps) {
  const addMapping = () => {
    const newMapping: ParameterMapping = {
      id: `mapping-${Date.now()}`,
      sourceField: '',
      targetField: '',
    };
    onChange([...mappings, newMapping]);
  };

  const updateMapping = (id: string, updates: Partial<ParameterMapping>) => {
    onChange(
      mappings.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );
  };

  const deleteMapping = (id: string) => {
    onChange(mappings.filter((m) => m.id !== id));
  };

  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-medium">{title}</h4>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>

      <div className="space-y-2">
        {mappings.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground text-sm border rounded-lg">
            暂无映射配置
          </div>
        ) : (
          mappings.map((mapping) => (
            <Card key={mapping.id} className="bg-muted/50">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <Select
                    value={mapping.sourceField}
                    onValueChange={(value) =>
                      updateMapping(mapping.id, { sourceField: value })
                    }
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="源字段" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSourceFields.map((field) => (
                        <SelectItem key={field} value={field}>
                          {field}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />

                  <Select
                    value={mapping.targetField}
                    onValueChange={(value) =>
                      updateMapping(mapping.id, { targetField: value })
                    }
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="目标字段" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTargetFields.map((field) => (
                        <SelectItem key={field} value={field}>
                          {field}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                    onClick={() => deleteMapping(mapping.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={addMapping}
        className="w-full"
      >
        <Plus className="mr-2 h-4 w-4" />
        添加映射
      </Button>
    </div>
  );
}
