import { NextRequest, NextResponse } from 'next/server';
import { validateCredentials, createToken } from '@/lib/auth';
import type { AdminCredentials, ApiResponse } from '@/lib/types';

export const POST = (request: NextRequest): Promise<NextResponse> => {
  return request.json()
    .then((credentials: AdminCredentials) => {
      return validateCredentials(credentials)
        .then(isValid => {
          if (!isValid) {
            const response: ApiResponse = { success: false, error: 'Invalid credentials' };
            return NextResponse.json(response, { status: 401 });
          }
          return createToken()
            .then(token => {
              const response: ApiResponse = { success: true };
              const nextResponse = NextResponse.json(response);
              nextResponse.cookies.set('admin-token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 86400
              });
              return nextResponse;
            });
        });
    })
    .catch(() => {
      const response: ApiResponse = { success: false, error: 'Server error' };
      return NextResponse.json(response, { status: 500 });
    });
};
