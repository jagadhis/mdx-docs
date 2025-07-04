import { NextRequest, NextResponse } from 'next/server';
import { publishDoc } from '@/lib/docs';
import type { ApiResponse } from '@/lib/types';

type PublishRequest = {
  readonly slug: string;
  readonly category: string;
};

export const POST = (request: NextRequest): Promise<NextResponse> => {
  return request.json()
    .then((body: PublishRequest) => publishDoc(body.slug, body.category))
    .then(() => {
      const response: ApiResponse = { success: true };
      return NextResponse.json(response);
    })
    .catch(error => {
      console.error('Error publishing document:', error);
      const response: ApiResponse = { success: false, error: 'Failed to publish document' };
      return NextResponse.json(response, { status: 500 });
    });
};
