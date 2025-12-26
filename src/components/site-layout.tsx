'use client';

import { Header } from './header';
import { User } from '@/lib/definitions';
import Link from 'next/link';

function Footer() {
    return (
        <footer className="w-full border-t border-border/50 py-6 mt-16">
            <div className="container mx-auto px-4 flex justify-between items-center text-sm text-muted-foreground">
                <p>&copy; {new Date().getFullYear()} OpenMark Blog. All rights reserved.</p>
                <nav>
                    <Link href="/" className="hover:text-primary">Home</Link>
                </nav>
            </div>
        </footer>
    );
}


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
      <Footer />
    </>
  );
}
