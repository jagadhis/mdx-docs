'use client';

import { MDXEditor } from '@/components/admin/editor'
import { MDXPreview } from '@/components/admin/preview'
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Save, Eye, Settings } from 'lucide-react';
import type { DocContent, DocMetadata } from '@/lib/types';

export default function EditorPage() {
  const searchParams = useSearchParams();
  const slug = searchParams.get('slug');
  const [content, setContent] = useState<string>('# New Document\n\nStart writing your documentation here...');
  const [metadata, setMetadata] = useState<DocMetadata>({
    title: 'New Document',
    description: '',
    slug: slug || `doc-${Date.now()}`,
    category: 'general',
    order: 0,
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  const saveDoc = (): void => {
    setSaving(true);
    const docContent: DocContent = { metadata, content };

    fetch('/api/admin/docs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(docContent)
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          console.log('Document saved successfully');
        }
      })
      .finally(() => setSaving(false));
  };

  return (
    <div className="h-screen w-full flex flex-col bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shrink-0">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center space-x-4 flex-1">
            <Input
              value={metadata.title}
              onChange={e => setMetadata(prev => ({ ...prev, title: e.target.value }))}
              className="text-lg font-semibold border-none shadow-none px-0 focus-visible:ring-0"
              placeholder="Document Title"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
            >
              <Eye className="mr-2 h-4 w-4" />
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </Button>
            <Button onClick={saveDoc} disabled={saving} size="sm">
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Saving...' : 'Save Draft'}
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {showSettings && (
          <div className="w-80 border-r bg-muted/10 p-4 space-y-4 shrink-0">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Document Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Description</label>
                  <Textarea
                    value={metadata.description}
                    onChange={e => setMetadata(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description..."
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Slug</label>
                  <Input
                    value={metadata.slug}
                    onChange={e => setMetadata(prev => ({ ...prev, slug: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Category</label>
                  <Input
                    value={metadata.category}
                    onChange={e => setMetadata(prev => ({ ...prev, category: e.target.value }))}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="flex-1 flex min-w-0">
          <div className={`${showPreview ? "w-1/2" : "w-full"} min-w-0`}>
            <div className="h-full p-4">
              <MDXEditor initialContent={content} onChange={setContent} />
            </div>
          </div>

          {showPreview && (
            <>
              <Separator orientation="vertical" className="shrink-0" />
              <div className="w-1/2 p-4 min-w-0">
                <MDXPreview content={content} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
