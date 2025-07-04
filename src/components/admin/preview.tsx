'use client';

import { useState, useEffect } from 'react';
import { MDXRemote } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Eye } from 'lucide-react';
import type { PreviewProps } from '@/lib/types';
import type { MDXRemoteSerializeResult } from 'next-mdx-remote';

export const MDXPreview = ({ content }: PreviewProps) => {
  const [cachedSource, setCachedSource] = useState<MDXRemoteSerializeResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!content.trim()) {
      setCachedSource(null);
      return;
    }

    setLoading(true);
    const timeoutId = setTimeout(() => {
      serialize(content)
        .then(source => {
          setCachedSource(source);
          setLoading(false);
        })
        .catch(() => {
          setCachedSource(null);
          setLoading(false);
        });
    }, 300);

    return () => {
      clearTimeout(timeoutId);
      setLoading(false);
    };
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
            ) : loading ? (
              <div className="text-muted-foreground italic">Rendering preview...</div>
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
