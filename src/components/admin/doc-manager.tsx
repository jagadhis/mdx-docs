'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Edit, Globe, Plus } from 'lucide-react';
import type { DocMetadata } from '@/lib/types';

export const DocManager = () => {
  const [drafts, setDrafts] = useState<DocMetadata[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch('/api/admin/docs')
      .then(response => response.json())
      .then(data => data.success ? setDrafts(data.data) : console.error(data.error))
      .finally(() => setLoading(false));
  }, []);

  const publishDoc = (slug: string): void => {
    fetch('/api/admin/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug })
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setDrafts(prev => prev.filter(draft => draft.slug !== slug));
        }
      });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Document Manager</h2>
          <p className="text-muted-foreground">Manage your documentation drafts and published content</p>
        </div>
        <Button onClick={() => window.open('/admin/editor', '_blank')}>
          <Plus className="mr-2 h-4 w-4" />
          New Document
        </Button>
      </div>

      <div className="grid gap-4">
        {drafts.map(draft => (
          <Card key={draft.slug}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{draft.title}</CardTitle>
                  <CardDescription>{draft.description}</CardDescription>
                </div>
                <Badge variant={draft.status === 'published' ? 'default' : 'secondary'}>
                  {draft.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Updated {new Date(draft.updatedAt).toLocaleDateString()}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`/admin/editor?slug=${draft.slug}`, '_blank')}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => publishDoc(draft.slug)}
                  >
                    <Globe className="mr-2 h-4 w-4" />
                    Publish
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {drafts.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">No drafts available</p>
              <Button onClick={() => window.open('/admin/editor', '_blank')}>
                Create your first document
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
