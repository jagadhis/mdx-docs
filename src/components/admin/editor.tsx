'use client';

import { Editor } from '@monaco-editor/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { EditorProps } from '@/lib/types';

export const MDXEditor = ({ initialContent, onChange }: EditorProps) => {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">MDX Editor</CardTitle>
      </CardHeader>
      <CardContent className="h-full p-0">
        <Editor
          height="calc(100% - 60px)"
          defaultLanguage="markdown"
          value={initialContent}
          onChange={value => onChange(value || '')}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            wordWrap: 'on',
            lineNumbers: 'on',
            fontSize: 14,
            scrollBeyondLastLine: false,
            padding: { top: 16, bottom: 16 }
          }}
        />
      </CardContent>
    </Card>
  );
};
