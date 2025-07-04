import { NextResponse } from 'next/server';
import { getPublishedDocs } from '@/lib/publish-operations';
import type { ApiResponse, DocMetadata } from '@/lib/types';

export const GET = (): Promise<NextResponse> => {
  return getPublishedDocs()
    .then(docs => {
      const response: ApiResponse<DocMetadata[]> = { success: true, data: docs };
      return NextResponse.json(response);
    })
    .catch(error => {
      console.error('Error fetching published docs:', error);
      const response: ApiResponse = { success: false, error: 'Failed to fetch published documents' };
      return NextResponse.json(response, { status: 500 });
    });
};
