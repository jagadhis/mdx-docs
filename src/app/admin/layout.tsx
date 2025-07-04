import type { PropsWithChildren } from 'react';

export default async function AdminLayout({ children }: Readonly<PropsWithChildren>) {
  return <>{children}</>;
}
