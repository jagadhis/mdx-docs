'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import {
  Edit,
  Globe,
  Plus,
  Trash2,
  AlertTriangle,
  ExternalLink,
  GitBranch,
  History,
  RefreshCw
} from 'lucide-react';
import type { DocMetadata } from '@/lib/types';

type EnhancedDocMetadata = DocMetadata & {
  prNumber?: number;
  branchName?: string;
  prUrl?: string;
};

export const DocManager = () => {
  const [allDocs, setAllDocs] = useState<EnhancedDocMetadata[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [deleting, setDeleting] = useState<string>('');
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    doc: EnhancedDocMetadata | null;
  }>({ open: false, doc: null });

  const loadAllDocs = useCallback(() => {
    if (typeof window === 'undefined') return;

    setLoading(true);

    Promise.all([
      fetch('/api/admin/drafts').then(res => res.json()),
      fetch('/api/admin/docs').then(res => res.json())
    ])
      .then(([draftsResponse, publishedResponse]) => {
        const drafts = draftsResponse.success ? draftsResponse.data : [];
        const published = publishedResponse.success ? publishedResponse.data : [];

        const enhancedDrafts = drafts.map((draft: DocMetadata & { prNumber?: number; branchName?: string }) => ({
          ...draft,
          prUrl: draft.prNumber ? `https://github.com/${process.env.NEXT_PUBLIC_GITHUB_OWNER}/${process.env.NEXT_PUBLIC_GITHUB_REPO}/pull/${draft.prNumber}` : undefined
        }));

        const combinedDocs = [...enhancedDrafts, ...published]
          .sort((a, b) => {
            if (a.category !== b.category) return a.category.localeCompare(b.category);
            return a.title.localeCompare(b.title);
          });

        setAllDocs(combinedDocs);
      })
      .catch(error => console.error('Failed to load docs:', error))
      .finally(() => setLoading(false));
  }, []);

  useState(() => {
    loadAllDocs();
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
          loadAllDocs();
        } else {
          console.error('Failed to publish:', data.error);
        }
      })
      .catch(error => console.error('Publish error:', error));
  }, [loadAllDocs]);

  const confirmDelete = useCallback((doc: EnhancedDocMetadata): void => {
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
          setDeleteDialog({ open: false, doc: null });
          loadAllDocs();
        } else {
          console.error('Failed to delete:', data.error);
        }
      })
      .catch(error => console.error('Delete error:', error))
      .finally(() => setDeleting(''));
  }, [deleteDialog.doc, loadAllDocs]);

  const cancelDelete = useCallback((): void => {
    setDeleteDialog({ open: false, doc: null });
  }, []);

  const getStatusBadge = (doc: EnhancedDocMetadata) => {
    if (doc.status === 'draft') {
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
          Draft
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
        Published
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-80" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-32" />
          </div>
        </div>
        <div className="border rounded-lg">
          <div className="p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b last:border-b-0">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Documentation</h2>
            <p className="text-muted-foreground">All documentation in the repository</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={loadAllDocs}
              variant="outline"
              size="sm"
              disabled={loading}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={() => window.open('/admin/editor', '_blank')}>
              <Plus className="mr-2 h-4 w-4" />
              New Document
            </Button>
          </div>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allDocs.map(doc => (
                <TableRow key={`${doc.category}-${doc.slug}`} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{doc.title}</div>
                      {doc.description && (
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {doc.description}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-mono">{doc.slug}</span>
                        {doc.branchName && (
                          <div className="flex items-center gap-1">
                            <GitBranch className="h-3 w-3" />
                            <span className="font-mono">{doc.branchName}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {doc.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(doc)}
                      {doc.prNumber && (
                        <a
                          href={doc.prUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                        >
                          PR #{doc.prNumber}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(doc.updatedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`/admin/history?slug=${doc.slug}&category=${doc.category}`, '_blank')}
                      >
                        <History className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`/admin/editor?slug=${doc.slug}&category=${doc.category}`, '_blank')}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {doc.status === 'draft' && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => publishDoc(doc.slug, doc.category)}
                          >
                            <Globe className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => confirmDelete(doc)}
                            disabled={deleting === doc.slug}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}

              {allDocs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
                    <div className="space-y-2">
                      <p className="text-muted-foreground">No documentation found</p>
                      <Button onClick={() => window.open('/admin/editor', '_blank')} variant="outline">
                        Create your first document
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <AlertDialog open={deleteDialog.open} onOpenChange={cancelDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Draft
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &#34;{deleteDialog.doc?.title}&#34;? This will close the PR and delete the branch.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={executeDeletion}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Draft
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
