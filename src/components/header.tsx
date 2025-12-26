'use client';

import Link from 'next/link';
import { BookOpen, PlusCircle, Search } from 'lucide-react';
import { AuthButton } from './auth-button';
import { User } from '@/lib/definitions';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

export function Header({ user }: { user: User | null }) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const canCreate = user && ['ADMIN', 'EDITOR', 'AUTHOR'].includes(user.role);

  return (
    <header 
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        isScrolled ? 'py-2' : 'py-4'
      )}
    >
        <div className="absolute inset-0 w-full h-full bg-header-background backdrop-blur-sm border-b border-header-border"></div>
        <div className="container mx-auto px-4 relative">
            <div className="flex items-center justify-between">
            
            <div className="flex-1 flex justify-start">
                <Button variant="ghost" size="icon">
                    <Search className="h-5 w-5" />
                    <span className="sr-only">Search</span>
                </Button>
            </div>

            <div className="flex-1 flex justify-center">
                <Link href="/" className="flex flex-col items-center gap-1 group" prefetch={false}>
                    <BookOpen className={cn("text-primary transition-all duration-300", isScrolled ? "h-6 w-6" : "h-7 w-7")} />
                    <div className="flex flex-col items-center">
                        <span className={cn("font-headline font-bold tracking-tight transition-all duration-300", isScrolled ? "text-lg" : "text-xl")}>
                            OPENMARK
                        </span>
                        <span className="text-xs text-muted-foreground font-medium group-hover:text-foreground transition-colors">Blog / Docs</span>
                    </div>
                </Link>
            </div>
            
            <div className="flex-1 flex justify-end items-center gap-2">
                {canCreate && (
                    <Button variant="ghost" size="sm" asChild>
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
