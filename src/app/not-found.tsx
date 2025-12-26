import { Button } from '@/components/ui/button';
import { FileQuestion } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] text-center px-4 overflow-hidden">
        <div className="absolute inset-0 bg-background z-0">
            <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(to_bottom,white_10%,transparent_50%)] dark:bg-grid-slate-700/40"></div>
        </div>
        <div className="relative z-10 flex flex-col items-center">
            <FileQuestion className="w-24 h-24 text-primary mb-6 animate-pulse" />
            <h1 className="text-5xl md:text-6xl font-headline font-bold mb-4">404 - Page Not Found</h1>
            <p className="text-lg text-muted-foreground max-w-lg mb-8">
                Sorry, the page you are looking for does not exist or has been moved. Check the URL or go back home.
            </p>
            <Button asChild size="lg">
                <Link href="/">Back to Home</Link>
            </Button>
        </div>
    </div>
  );
}
