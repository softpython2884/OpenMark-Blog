'use client';

import { Header } from './header';
import { User } from '@/lib/definitions';

export function SiteLayout({
  user,
  children,
}: {
  user: User | null;
  children: React.ReactNode;
}) {
  return (
    <>
      <Header user={user} />
      <main className="flex-1">{children}</main>
    </>
  );
}
