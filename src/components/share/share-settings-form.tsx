'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EXPIRY_OPTIONS, ShareSettings } from '@/types/share';

interface ShareSettingsFormProps {
  settings: ShareSettings;
  onChange: (settings: ShareSettings) => void;
}

export function ShareSettingsForm({ settings, onChange }: ShareSettingsFormProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>有效期</Label>
        <Select
          value={settings.expiresInDays?.toString() || 'null'}
          onValueChange={(value) =>
            onChange({
              ...settings,
              expiresInDays: value === 'null' ? null : parseInt(value),
            })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {EXPIRY_OPTIONS.map((option) => (
              <SelectItem key={String(option.value)} value={String(option.value)}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="allow-export">允许导出</Label>
          <p className="text-sm text-muted-foreground">
            允许查看者导出为 Markdown 格式
          </p>
        </div>
        <Switch
          id="allow-export"
          checked={settings.allowExport}
          onCheckedChange={(checked) =>
            onChange({ ...settings, allowExport: checked })
          }
        />
      </div>
    </div>
  );
}
