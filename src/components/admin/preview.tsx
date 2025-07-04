'use client';

import { useState, useMemo } from 'react';
import { MDXRemote } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Eye } from 'lucide-react';
import type { PreviewProps } from '@/lib/types';

export const MDXPreview = ({ content }: PreviewProps) => {
  const [cachedSource, setCachedSource] = useState<any>(null);

  const mdxSource = useMemo(() => {
    if (!content.trim()) return null;

    const timeoutId = setTimeout(() => {
      serialize(content)
        .then(source => setCachedSource(source))
        .catch(() => setCachedSource(null));
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [content]);

  return (
    <Card className="h-full shadow-sm border-muted">
      <CardHeader className="pb-3 border-b border-muted">
        <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
          <Eye className="h-4 w-4" />
          Live Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="h-full p-0">
        <ScrollArea className="h-full">
          <div className="p-6 prose prose-sm max-w-none dark:prose-invert prose-gray">
            {cachedSource ? (
              <MDXRemote {...cachedSource} />
            ) : content.trim() ? (
              <div className="text-muted-foreground italic">Rendering preview...</div>
            ) : (
              <div className="text-muted-foreground italic">Start typing to see preview...</div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
