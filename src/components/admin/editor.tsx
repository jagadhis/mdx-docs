'use client';

import { Editor } from '@monaco-editor/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileEdit } from 'lucide-react';
import type { EditorProps } from '@/lib/types';

export const MDXEditor = ({ initialContent, onChange }: EditorProps) => {
  return (
    <Card className="h-full shadow-sm border-muted">
      <CardHeader className="pb-3 border-b border-muted">
        <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
          <FileEdit className="h-4 w-4" />
          MDX Editor
        </CardTitle>
      </CardHeader>
      <CardContent className="h-full p-0">
        <Editor
          height="calc(100% - 60px)"
          defaultLanguage="markdown"
          value={initialContent}
          onChange={value => onChange(value || '')}
          options={{
            minimap: { enabled: false },
            wordWrap: 'on',
            lineNumbers: 'on',
            fontSize: 14,
            scrollBeyondLastLine: false,
            padding: { top: 16, bottom: 16 },
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            renderLineHighlight: 'gutter',
            overviewRulerBorder: false,
            hideCursorInOverviewRuler: true,
            lineDecorationsWidth: 0,
            lineNumbersMinChars: 3,
            glyphMargin: false,
            folding: false
          }}
        />
      </CardContent>
    </Card>
  );
};
