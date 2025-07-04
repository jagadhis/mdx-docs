'use client';

import { useState, useEffect } from 'react';
import { MDXRemote } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { PreviewProps } from '@/lib/types';

export const MDXPreview = ({ content }: PreviewProps) => {
  const [mdxSource, setMdxSource] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (content) {
      serialize(content)
        .then(source => {
          setMdxSource(source);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [content]);

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Live Preview</CardTitle>
      </CardHeader>
      <CardContent className="h-full p-0">
        <ScrollArea className="h-full">
          <div className="p-6 prose prose-sm max-w-none dark:prose-invert">
            {loading ? (
              <div className="text-muted-foreground">Loading preview...</div>
            ) : mdxSource ? (
              <MDXRemote {...mdxSource} />
            ) : (
              <div className="text-muted-foreground">Start typing to see preview...</div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
