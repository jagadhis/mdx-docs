import { NextRequest, NextResponse } from 'next/server';
import { saveDraft, getDrafts } from '@/lib/draft-operations';
import type { DocContent, ApiResponse, DocMetadata } from '@/lib/types';

type EnhancedDocMetadata = DocMetadata & {
  prNumber?: number;
  branchName?: string;
};

export const GET = (): Promise<NextResponse> => {
  return getDrafts()
    .then(drafts => {
      const enhancedDrafts: EnhancedDocMetadata[] = drafts.map(draft => ({
        ...draft,
        branchName: `docs/${draft.category}/${draft.slug}`
      }));

      const response: ApiResponse<EnhancedDocMetadata[]> = { success: true, data: enhancedDrafts };
      return NextResponse.json(response);
    })
    .catch(error => {
      console.error('Error fetching drafts:', error);
      const response: ApiResponse = { success: false, error: 'Failed to fetch drafts' };
      return NextResponse.json(response, { status: 500 });
    });
};

export const POST = (request: NextRequest): Promise<NextResponse> => {
  return request.json()
    .then((docContent: DocContent) => {
      const updatedContent: DocContent = {
        ...docContent,
        metadata: {
          ...docContent.metadata,
          updatedAt: new Date().toISOString()
        }
      };

      return saveDraft(docContent.metadata.slug, updatedContent);
    })
    .then(result => {
      const response: ApiResponse<{ prNumber: number; branchName: string }> = {
        success: true,
        data: result
      };
      return NextResponse.json(response);
    })
    .catch(error => {
      console.error('Error saving draft:', error);
      const response: ApiResponse = { success: false, error: 'Failed to save draft' };
      return NextResponse.json(response, { status: 500 });
    });
};
