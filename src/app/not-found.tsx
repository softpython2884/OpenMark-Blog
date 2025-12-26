import { Button } from '@/components/ui/button';
import { FileQuestion } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] text-center px-4">
      <FileQuestion className="w-24 h-24 text-primary mb-6" />
      <h1 className="text-5xl font-headline font-bold mb-4">404 - Page Introuvable</h1>
      <p className="text-lg text-muted-foreground max-w-lg mb-8">
        Désolé, la page que vous cherchez n'existe pas ou a été déplacée. Vérifiez l'URL ou retournez à l'accueil.
      </p>
      <Button asChild size="lg">
        <Link href="/">Retour à l'accueil</Link>
      </Button>
    </div>
  );
}
