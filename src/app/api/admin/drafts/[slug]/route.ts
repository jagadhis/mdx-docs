import { NextRequest, NextResponse } from 'next/server';
import { getDraft, deleteDraft } from '@/lib/docs';
import type { ApiResponse, DocContent } from '@/lib/types';

export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
): Promise<NextResponse> => {
  const { slug } = await params;
  const url = new URL(request.url);
  const category = url.searchParams.get('category');

  if (!category) {
    const response: ApiResponse = { success: false, error: 'Category parameter is required' };
    return NextResponse.json(response, { status: 400 });
  }

  return getDraft(slug, category)
    .then(draft => {
      const response: ApiResponse<DocContent> = { success: true, data: draft };
      return NextResponse.json(response);
    })
    .catch(error => {
      console.error('Error fetching draft:', error);
      const response: ApiResponse = { success: false, error: 'Draft not found' };
      return NextResponse.json(response, { status: 404 });
    });
};

export const DELETE = async (
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
): Promise<NextResponse> => {
  const { slug } = await params;
  const url = new URL(request.url);
  const category = url.searchParams.get('category');

  if (!category) {
    const response: ApiResponse = { success: false, error: 'Category parameter is required' };
    return NextResponse.json(response, { status: 400 });
  }

  return deleteDraft(slug, category)
    .then(() => {
      const response: ApiResponse = { success: true };
      return NextResponse.json(response);
    })
    .catch(error => {
      console.error('Error deleting draft:', error);
      const response: ApiResponse = { success: false, error: 'Failed to delete draft' };
      return NextResponse.json(response, { status: 500 });
    });
};
