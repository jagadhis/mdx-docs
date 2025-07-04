import { NextRequest, NextResponse } from 'next/server';
import { publishDoc } from '@/lib/docs';
import type { ApiResponse } from '@/lib/types';

type PublishRequest = {
  readonly slug: string;
};

export const POST = (request: NextRequest): Promise<NextResponse> => {
  return request.json()
    .then((body: PublishRequest) => publishDoc(body.slug))
    .then(() => {
      const response: ApiResponse = { success: true };
      return NextResponse.json(response);
    })
    .catch(() => {
      const response: ApiResponse = { success: false, error: 'Failed to publish document' };
      return NextResponse.json(response, { status: 500 });
    });
};
