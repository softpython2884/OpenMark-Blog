'use client';

import { Header } from './header';
import { User } from '@/lib/definitions';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Heart } from 'lucide-react';

function Footer() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const isBottom = Math.ceil(window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 10; // 10px buffer
            if (isBottom) {
                setIsVisible(true);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <footer className={cn(
            "w-full transition-all duration-500 ease-in-out transform",
            isVisible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
        )}>
            <div className="border-t border-border/50 py-8">
                <div className="container mx-auto px-4 text-center text-muted-foreground">
                    <div className="flex items-center justify-center gap-1.5 mb-4">
                        Created with <Heart className="h-4 w-4 text-red-500 fill-current" /> by 
                        <a 
                            href="https://forgenet.fr" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="font-semibold text-foreground hover:text-primary transition-colors"
                        >
                            Forge Network
                        </a>
                    </div>
                    <div className="text-sm space-x-4 mb-2">
                        <Link href="/privacy-policy" className="hover:text-primary">Privacy Policy</Link>
                        <span>&middot;</span>
                        <Link href="/terms-of-service" className="hover:text-primary">Terms of Service</Link>
                        <span>&middot;</span>
                        <Link href="/legal" className="hover:text-primary">Legal</Link>
                    </div>
                    <p className="text-xs">&copy; {new Date().getFullYear()} OpenMark Blog. All rights reserved.</p>
                </div>
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
