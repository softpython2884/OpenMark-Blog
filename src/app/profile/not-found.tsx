import { Button } from '@/components/ui/button';
import { UserSearch } from 'lucide-react';
import Link from 'next/link';

export default function ProfileNotFound() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] text-center px-4 overflow-hidden">
      <div className="absolute inset-0 bg-background z-0">
          <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(to_bottom,white_10%,transparent_50%)] dark:bg-grid-slate-700/40"></div>
      </div>
      <div className="relative z-10 flex flex-col items-center">
        <UserSearch className="w-24 h-24 text-primary mb-6" />
        <h1 className="text-5xl md:text-6xl font-headline font-bold mb-4">User Not Found</h1>
        <p className="text-lg text-muted-foreground max-w-lg mb-8">
          Sorry, we couldn't find the profile you're looking for. The user may not exist or the URL is incorrect.
        </p>
        <Button asChild size="lg">
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    </div>
  );
}
