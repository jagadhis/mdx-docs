import { compare } from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import type { AdminCredentials } from './types';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');
const adminUser = process.env.ADMIN_USERNAME || 'admin';
const adminPassHash = process.env.ADMIN_PASSWORD || '$2b$12$ZUuDAlQ5AqWW6a5R38VU8uLLeejTYG6KtoxL8SX9AF0eqYwoVfrmy';

export const validateCredentials = (credentials: AdminCredentials): Promise<boolean> => {

  if (credentials.username !== adminUser) {
    return Promise.resolve(false);
  }

  return compare(credentials.password, adminPassHash)
    .then(result => {
      return result;
    });
};

export const createToken = (): Promise<string> => {
  return new SignJWT({ admin: true })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .sign(secret);
};

export const verifyToken = (token: string): Promise<boolean> => {
  return jwtVerify(token, secret)
    .then(() => true)
    .catch(() => false);
};
