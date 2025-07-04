import { NextRequest, NextResponse } from 'next/server';
import { getPublishedDoc } from '@/lib/docs';
import type { ApiResponse, DocContent } from '@/lib/types';

export const GET = (
  request: NextRequest,
  { params }: { params: { slug: string } }
): Promise<NextResponse> => {
  const { slug } = params;
  const url = new URL(request.url);
  const category = url.searchParams.get('category');

  if (!category) {
    const response: ApiResponse = { success: false, error: 'Category parameter is required' };
    return Promise.resolve(NextResponse.json(response, { status: 400 }));
  }

  return getPublishedDoc(slug, category)
    .then(doc => {
      const response: ApiResponse<DocContent> = { success: true, data: doc };
      return NextResponse.json(response);
    })
    .catch(error => {
      console.error('Error fetching published doc:', error);
      const response: ApiResponse = { success: false, error: 'Published document not found' };
      return NextResponse.json(response, { status: 404 });
    });
};
