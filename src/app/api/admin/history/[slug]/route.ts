import { NextRequest, NextResponse } from 'next/server';
import { getDocumentHistory } from '@/lib/history-operations';
import type { ApiResponse } from '@/lib/types';

type VersionHistory = {
  sha: string;
  message: string;
  author: string;
  date: string;
  avatar: string;
  type: 'feat' | 'docs' | 'fix' | 'chore';
};

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

  return getDocumentHistory(slug, category)
    .then(history => {
      const response: ApiResponse<VersionHistory[]> = { success: true, data: history };
      return NextResponse.json(response);
    })
    .catch(error => {
      console.error('Error fetching document history:', error);
      const response: ApiResponse = { success: false, error: 'Failed to fetch document history' };
      return NextResponse.json(response, { status: 500 });
    });
};
