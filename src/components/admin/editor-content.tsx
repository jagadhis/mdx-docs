'use client';

import { MDXEditor } from '@/components/admin/editor'
import { MDXPreview } from '@/components/admin/preview'
import { ArrowLeft, Eye, FileText, Save, Settings } from 'lucide-react'
import { useState, useCallback, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import type { DocContent, DocMetadata } from '@/lib/types';

export function EditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = searchParams.get('slug');
  const category = searchParams.get('category');

  const [content, setContent] = useState<string>('# New Document\n\nStart writing your documentation here...');
  const [metadata, setMetadata] = useState<DocMetadata>({
    title: 'New Document',
    description: '',
    slug: slug || `doc-${Date.now()}`,
    category: category || 'general',
    icon: undefined,
    order: 0,
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (slug && category) {
      setLoading(true);
      fetch(`/api/admin/drafts/${slug}?category=${category}`)
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            setContent(data.data.content);
            setMetadata(data.data.metadata);
          }
        })
        .catch(error => console.error('Error loading draft:', error))
        .finally(() => setLoading(false));
    }
  }, [slug, category]);

  const hasUnsavedChanges = useMemo(() => {
    return Boolean(content.trim() && metadata.title.trim());
  }, [content, metadata.title]);

  const saveDoc = useCallback((): void => {
    if (saving) return;

    setSaving(true);
    const docContent: DocContent = {
      metadata: { ...metadata, updatedAt: new Date().toISOString() },
      content
    };

    fetch('/api/admin/drafts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(docContent)
    })
      .then(response => response.json())
      .then(data => {
        if (data.success && !slug) {
          window.history.replaceState(null, '', `/admin/editor?slug=${metadata.slug}&category=${metadata.category}`);
        }
      })
      .catch(error => console.error('Save error:', error))
      .finally(() => setSaving(false));
  }, [saving, metadata, content, slug]);

  const handleBackToDashboard = useCallback((): void => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm('You have unsaved changes. Are you sure you want to leave?');
      if (!confirmed) return;
    }
    router.push('/admin/dashboard');
  }, [hasUnsavedChanges, router]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading draft...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col bg-background overflow-hidden">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shrink-0 sticky top-0 z-10">
        <div className="flex h-16 items-center justify-between px-6 gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToDashboard}
              className="text-muted-foreground hover:text-foreground shrink-0"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
            <Separator orientation="vertical" className="h-6 shrink-0" />
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Input
                value={metadata.title}
                onChange={e => setMetadata(prev => ({ ...prev, title: e.target.value }))}
                className="text-lg font-semibold border-none shadow-none px-0 focus-visible:ring-0 bg-transparent flex-1 min-w-0"
                placeholder="Document Title"
              />
              {hasUnsavedChanges && (
                <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200 shrink-0">
                  Unsaved
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant={showSettings ? "default" : "outline"}
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
            <Button
              variant={showPreview ? "default" : "outline"}
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
            >
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Button>
            <Button onClick={saveDoc} disabled={saving} size="sm">
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden min-h-0">
        {showSettings && (
          <div className="w-80 border-r bg-muted/10 shrink-0 overflow-y-auto">
            <div className="p-4">
              <Card className="shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Document Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-xs font-medium">Title</Label>
                    <Input
                      id="title"
                      value={metadata.title}
                      onChange={e => setMetadata(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Document title"
                      className="h-9"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-xs font-medium">Description</Label>
                    <Textarea
                      id="description"
                      value={metadata.description}
                      onChange={e => setMetadata(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description of the document"
                      rows={3}
                      className="resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slug" className="text-xs font-medium">Slug</Label>
                    <Input
                      id="slug"
                      value={metadata.slug}
                      onChange={e => setMetadata(prev => ({ ...prev, slug: e.target.value }))}
                      placeholder="document-slug"
                      className="h-9 text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-xs font-medium">Category</Label>
                    <Input
                      id="category"
                      value={metadata.category}
                      onChange={e => setMetadata(prev => ({ ...prev, category: e.target.value }))}
                      placeholder="general"
                      className="h-9"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="icon" className="text-xs font-medium">Icon (Lucide)</Label>
                    <Input
                      id="icon"
                      value={metadata.icon || ''}
                      onChange={e => setMetadata(prev => ({ ...prev, icon: e.target.value || undefined }))}
                      placeholder="BookMarked"
                      className="h-9"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="order" className="text-xs font-medium">Order</Label>
                    <Input
                      id="order"
                      type="number"
                      value={metadata.order}
                      onChange={e => setMetadata(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                      placeholder="0"
                      className="h-9"
                    />
                  </div>

                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground mb-2">
                      Generated YAML frontmatter:
                    </p>
                    <div className="p-2 bg-muted/50 rounded text-xs font-mono leading-relaxed">
                      ---<br/>
                      title: &#34;{metadata.title}&#34;<br/>
                      description: &#34;{metadata.description}&#34;<br/>
                      {metadata.icon && <>icon: &#34;{metadata.icon}&#34;<br/></>}
                      {metadata.order !== 0 && <>order: {metadata.order}<br/></>}
                      ---
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        <div className="flex-1 flex min-w-0 overflow-hidden">
          <div className={`${showPreview ? (showSettings ? "w-1/2" : "w-1/2") : "w-full"} min-w-0 overflow-hidden`}>
            <div className="h-full p-4">
              <MDXEditor initialContent={content} onChange={setContent} />
            </div>
          </div>

          {showPreview && (
            <>
              <Separator orientation="vertical" className="shrink-0" />
              <div className={`${showSettings ? "w-1/2" : "w-1/2"} min-w-0 overflow-hidden`}>
                <div className="h-full p-4">
                  <MDXPreview content={content} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
