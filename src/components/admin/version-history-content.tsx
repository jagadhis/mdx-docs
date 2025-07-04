'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
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
import { ArrowLeft, GitCommit, Calendar, User, ExternalLink, RefreshCw } from 'lucide-react';

type VersionHistory = {
  sha: string;
  message: string;
  author: string;
  date: string;
  avatar: string;
  type: 'feat' | 'docs' | 'fix' | 'chore';
};

export function VersionHistoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = searchParams.get('slug');
  const category = searchParams.get('category');

  const [history, setHistory] = useState<VersionHistory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [docTitle, setDocTitle] = useState<string>('');

  const loadHistory = () => {
    if (!slug || !category) return;

    setLoading(true);

    Promise.all([
      fetch(`/api/admin/history/${slug}?category=${category}`),
      fetch(`/api/admin/drafts/${slug}?category=${category}`)
        .catch(() => fetch(`/api/admin/docs/${slug}?category=${category}`))
    ])
      .then(async ([historyResponse, docResponse]) => {
        const historyData = await historyResponse.json();
        const docData = await docResponse.json();

        if (historyData.success) {
          setHistory(historyData.data);
        }

        if (docData.success) {
          setDocTitle(docData.data.metadata.title);
        }
      })
      .catch(error => console.error('Error loading history:', error))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadHistory();
  }, [slug, category]);

  const getCommitTypeColor = (type: string) => {
    switch (type) {
      case 'feat': return 'bg-green-50 text-green-700 border-green-200';
      case 'docs': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'fix': return 'bg-red-50 text-red-700 border-red-200';
      case 'chore': return 'bg-gray-50 text-gray-700 border-gray-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="h-screen w-full bg-background">
        <div className="border-b bg-background sticky top-0 z-50">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Skeleton className="h-9 w-20" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              <Skeleton className="h-9 w-24" />
            </div>
          </div>
        </div>
        <div className="px-6 py-6">
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Commit</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="space-y-1">
                        <Skeleton className="h-5 w-64" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-16" />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-6 w-6 rounded-full" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-8 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-background">
      <div className="border-b bg-background sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="shrink-0"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-semibold">{docTitle}</h1>
                <p className="text-sm text-muted-foreground">
                  Version history for {category}/{slug}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={loadHistory}
                variant="outline"
                size="sm"
                disabled={loading}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Commit</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.length > 0 ? (
                history.map((commit) => (
                  <TableRow key={commit.sha} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium leading-tight">
                          {commit.message.split('\n')[0]}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="font-mono">{commit.sha.substring(0, 7)}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getCommitTypeColor(commit.type)}>
                        {commit.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {commit.avatar ? (
                          <img
                            src={commit.avatar}
                            alt={commit.author}
                            className="h-6 w-6 rounded-full"
                          />
                        ) : (
                          <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                            <User className="h-3 w-3" />
                          </div>
                        )}
                        <span className="text-sm font-medium">{commit.author}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(commit.date)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                        >
                          <a
                            href={`https://github.com/${process.env.NEXT_PUBLIC_GITHUB_OWNER}/${process.env.NEXT_PUBLIC_GITHUB_REPO}/commit/${commit.sha}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
                    <div className="space-y-2">
                      <GitCommit className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No version history</h3>
                      <p className="text-muted-foreground">
                        This document doesn&#39;t have any commit history yet.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
