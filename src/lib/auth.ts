import { compare } from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import type { AdminCredentials } from './types';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');
const adminUser = process.env.ADMIN_USERNAME || 'admin';
const adminPassHash = process.env.ADMIN_PASSWORD || '$2b$12$ZUuDAlQ5AqWW6a5R38VU8uLLeejTYG6KtoxL8SX9AF0eqYwoVfrmy';

export const validateCredentials = (credentials: AdminCredentials): Promise<boolean> => {
  console.log('🔍 Debug Info:');
  console.log('1. Input username:', credentials.username);
  console.log('2. Expected username:', adminUser);
  console.log('3. Input password:', credentials.password);
  console.log('4. Expected hash:', adminPassHash);
  console.log('5. Username match:', credentials.username === adminUser);

  if (credentials.username !== adminUser) {
    console.log('❌ Username mismatch');
    return Promise.resolve(false);
  }

  return compare(credentials.password, adminPassHash)
    .then(result => {
      console.log('6. Password comparison result:', result);
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
