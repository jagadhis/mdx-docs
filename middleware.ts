import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');

export const middleware = async (request: NextRequest): Promise<NextResponse> => {
  if (!request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  if (request.nextUrl.pathname === '/admin/login') {
    return NextResponse.next();
  }

  const token = request.cookies.get('admin-token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  return jwtVerify(token, secret)
    .then(() => NextResponse.next())
    .catch(() => NextResponse.redirect(new URL('/admin/login', request.url)));
};

export const config = {
  matcher: ['/admin/:path*']
};
