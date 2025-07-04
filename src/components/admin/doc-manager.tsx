'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Edit, Globe, Plus, Trash2, AlertTriangle, Clock, Folder, Hash } from 'lucide-react';
import type { DocMetadata } from '@/lib/types';

export const DocManager = () => {
  const [drafts, setDrafts] = useState<DocMetadata[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [deleting, setDeleting] = useState<string>('');
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    doc: DocMetadata | null;
  }>({ open: false, doc: null });

  const loadDrafts = useCallback(() => {
    setLoading(true);
    fetch('/api/admin/drafts')
      .then(response => response.json())
      .then(data => data.success ? setDrafts(data.data) : console.error(data.error))
      .catch(error => console.error('Failed to load drafts:', error))
      .finally(() => setLoading(false));
  }, []);

  useState(() => {
    if (typeof window !== 'undefined') {
      loadDrafts();
    }
  });

  const publishDoc = useCallback((slug: string, category: string): void => {
    fetch('/api/admin/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, category })
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setDrafts(prev => prev.filter(draft => draft.slug !== slug));
        } else {
          console.error('Failed to publish:', data.error);
        }
      })
      .catch(error => console.error('Publish error:', error));
  }, []);

  const confirmDelete = useCallback((doc: DocMetadata): void => {
    setDeleteDialog({ open: true, doc });
  }, []);

  const executeDeletion = useCallback((): void => {
    if (!deleteDialog.doc) return;

    const { slug, category } = deleteDialog.doc;
    setDeleting(slug);

    fetch(`/api/admin/drafts/${slug}?category=${category}`, {
      method: 'DELETE'
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setDrafts(prev => prev.filter(draft => draft.slug !== slug));
          setDeleteDialog({ open: false, doc: null });
        } else {
          console.error('Failed to delete:', data.error);
        }
      })
      .catch(error => console.error('Delete error:', error))
      .finally(() => setDeleting(''));
  }, [deleteDialog.doc]);

  const cancelDelete = useCallback((): void => {
    setDeleteDialog({ open: false, doc: null });
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="border-muted">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                </div>
                <Skeleton className="h-5 w-12" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <div className="flex space-x-2">
                  <Skeleton className="h-9 w-16" />
                  <Skeleton className="h-9 w-20" />
                  <Skeleton className="h-9 w-18" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Document Manager</h2>
            <p className="text-muted-foreground">Manage your documentation drafts and published content</p>
          </div>
          <Button onClick={() => window.open('/admin/editor', '_blank')} className="shadow-sm">
            <Plus className="mr-2 h-4 w-4" />
            New Document
          </Button>
        </div>

        <div className="grid gap-4">
          {drafts.map(draft => (
            <Card key={`${draft.category}-${draft.slug}`} className="hover:shadow-md transition-all duration-200 border-muted">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{draft.title}</CardTitle>
                      <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                        draft
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">{draft.description}</div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Folder className="h-3 w-3" />
                        {draft.category}
                      </span>
                      {draft.icon && (
                        <span className="inline-flex items-center gap-1">
                          🎨 {draft.icon}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 font-mono text-xs">
                        <Hash className="h-3 w-3" />
                        {draft.slug}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    Updated {new Date(draft.updatedAt).toLocaleDateString()}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`/admin/editor?slug=${draft.slug}&category=${draft.category}`, '_blank')}
                      className="shadow-sm"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => publishDoc(draft.slug, draft.category)}
                      className="shadow-sm"
                    >
                      <Globe className="mr-2 h-4 w-4" />
                      Publish
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => confirmDelete(draft)}
                      disabled={deleting === draft.slug}
                      className="shadow-sm"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {deleting === draft.slug ? 'Deleting...' : 'Delete'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {drafts.length === 0 && (
            <Card className="border-dashed border-2 border-muted">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Plus className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No drafts available</h3>
                <p className="text-muted-foreground mb-4 text-center max-w-sm">
                  Get started by creating your first document. You can write, edit, and publish documentation easily.
                </p>
                <Button onClick={() => window.open('/admin/editor', '_blank')}>
                  Create your first document
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <AlertDialog open={deleteDialog.open} onOpenChange={cancelDelete}>
        <AlertDialogContent className="border-muted">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Draft
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &#34;{deleteDialog.doc?.title}&#34;? This action cannot be undone.
              <br />
              <br />
              <strong>This will permanently remove:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                <li>The MDX file: <code className="bg-muted px-1 py-0.5 rounded text-xs">{deleteDialog.doc?.slug}.mdx</code></li>
                <li>Entry from category meta.json</li>
                <li>All content and metadata</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={executeDeletion}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
