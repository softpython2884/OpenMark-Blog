'use client';

import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // On peut logger l'erreur ici, par exemple avec un service externe
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] text-center px-4">
      <AlertTriangle className="w-24 h-24 text-destructive mb-6" />
      <h1 className="text-5xl font-headline font-bold mb-4">Oops! Une erreur est survenue</h1>
      <p className="text-lg text-muted-foreground max-w-xl mb-8">
        Quelque chose s'est mal passé de notre côté. Vous pouvez essayer de rafraîchir la page ou retourner à l'accueil.
      </p>
      <div className="flex gap-4">
        <Button onClick={() => reset()} variant="outline">
          Réessayer
        </Button>
        <Button asChild>
          <Link href="/">Retour à l'accueil</Link>
        </Button>
      </div>
    </div>
  );
}
