'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShareSettingsForm } from './share-settings-form';
import { ShareLinkCard } from './share-link-card';
import { useShare } from '@/hooks/use-share';
import { ShareSettings } from '@/types/share';
import { Loader2, Plus } from 'lucide-react';

interface ShareModalProps {
  workflowId: string;
  isOpen: boolean;
  onClose: () => void;
  baseUrl: string;
}

export function ShareModal({ workflowId, isOpen, onClose, baseUrl }: ShareModalProps) {
  const { shareLinks, isLoading, fetchShareLinks, createShare, revokeShare } = useShare({
    workflowId,
  });
  const [settings, setSettings] = useState<ShareSettings>({
    expiresInDays: 7,
    allowExport: false,
  });
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchShareLinks();
    }
  }, [isOpen, fetchShareLinks]);

  const handleCreateShare = async () => {
    setIsCreating(true);
    try {
      await createShare({
        expiresInDays: settings.expiresInDays,
        allowExport: settings.allowExport,
      });
    } finally {
      setIsCreating(false);
    }
  };

  const activeLinks = shareLinks.filter(
    (link) => !link.expiresAt || new Date(link.expiresAt) > new Date()
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>分享工作流</DialogTitle>
          <DialogDescription>
            创建分享链接，让其他人可以查看您的工作流
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* 创建新分享 */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">创建新分享</h4>
            <ShareSettingsForm settings={settings} onChange={setSettings} />
            <Button
              onClick={handleCreateShare}
              disabled={isCreating}
              className="w-full"
            >
              {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Plus className="mr-2 h-4 w-4" />
              生成分享链接
            </Button>
          </div>

          {/* 现有分享链接 */}
          {activeLinks.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium">现有分享链接</h4>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {activeLinks.map((link) => (
                  <ShareLinkCard
                    key={link.id}
                    shareLink={link}
                    onRevoke={() => revokeShare(link.id)}
                    baseUrl={baseUrl}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
