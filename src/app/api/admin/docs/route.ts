import { NextRequest, NextResponse } from 'next/server';
import { saveDraft, getDrafts } from '@/lib/docs';
import type { DocContent, ApiResponse, DocMetadata } from '@/lib/types';

export const GET = (): Promise<NextResponse> => {
  return getDrafts()
    .then(drafts => {
      const response: ApiResponse<DocMetadata[]> = { success: true, data: drafts };
      return NextResponse.json(response);
    })
    .catch(() => {
      const response: ApiResponse = { success: false, error: 'Failed to fetch drafts' };
      return NextResponse.json(response, { status: 500 });
    });
};

export const POST = (request: NextRequest): Promise<NextResponse> => {
  return request.json()
    .then((docContent: DocContent) => {
      const updatedMetadata = {
        ...docContent.metadata,
        updatedAt: new Date().toISOString()
      };
      const updatedContent = {
        ...docContent,
        metadata: updatedMetadata
      };

      return saveDraft(docContent.metadata.slug, updatedContent);
    })
    .then(() => {
      const response: ApiResponse = { success: true };
      return NextResponse.json(response);
    })
    .catch(() => {
      const response: ApiResponse = { success: false, error: 'Failed to save draft' };
      return NextResponse.json(response, { status: 500 });
    });
};
