'use client';

import { ShareLink } from '@/types/share';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Link2, Eye, Ban } from 'lucide-react';
import { useState } from 'react';

interface ShareLinkCardProps {
  shareLink: ShareLink;
  onRevoke: () => void;
  baseUrl: string;
}

export function ShareLinkCard({ shareLink, onRevoke, baseUrl }: ShareLinkCardProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${baseUrl}/share/${shareLink.token}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  const isExpired = shareLink.expiresAt && new Date(shareLink.expiresAt) < new Date();

  return (
    <Card className={isExpired ? 'opacity-50' : ''}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link2 className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">分享链接</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {isExpired && <Badge variant="destructive">已过期</Badge>}
            {shareLink.allowExport && <Badge variant="secondary">可导出</Badge>}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
          <code className="flex-1 text-xs truncate">{shareUrl}</code>
          <Button
            variant="ghost"
            size="sm"
            onClick={copyToClipboard}
            className="h-8"
          >
            <Copy className="h-4 w-4 mr-1" />
            {copied ? '已复制' : '复制'}
          </Button>
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            <span>访问 {shareLink.viewCount} 次</span>
          </div>
          <div>
            {shareLink.expiresAt ? (
              <span>过期时间: {new Date(shareLink.expiresAt).toLocaleDateString()}</span>
            ) : (
              <span>永久有效</span>
            )}
          </div>
        </div>

        {!isExpired && (
          <Button
            variant="outline"
            size="sm"
            className="w-full text-destructive hover:text-destructive"
            onClick={onRevoke}
          >
            <Ban className="h-4 w-4 mr-1" />
            撤销分享
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
