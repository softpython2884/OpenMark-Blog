import Link from 'next/link';
import { Logo } from './logo';
import { AuthButton } from './auth-button';
import { User } from '@/lib/definitions';
import { Button } from './ui/button';
import { PlusCircle } from 'lucide-react';

export function Header({ user }: { user: User | null }) {
  const canCreate = user && ['ADMIN', 'EDITOR', 'AUTHOR'].includes(user.role);

  return (
    <header className="bg-card border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Logo />
          </div>
          <div className="flex items-center gap-4">
             {canCreate && (
              <Button variant="ghost" size="sm" asChild className="hidden md:flex">
                <Link href="/editor">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New Post
                </Link>
              </Button>
            )}
            <AuthButton user={user} />
          </div>
        </div>
      </div>
    </header>
  );
}
