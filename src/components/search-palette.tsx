'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Command, File, Loader2, Search as SearchIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { searchArticles } from '@/lib/actions';
import type { Article } from '@/lib/definitions';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';

interface SearchPaletteProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialQuery?: string;
}

// Function to highlight search term in text
const highlightText = (text: string, query: string) => {
  if (!query) return text;
  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <span key={i} className="font-bold text-primary">
            {part}
          </span>
        ) : (
          part
        )
      )}
    </>
  );
};


export function SearchPalette({ open, onOpenChange, initialQuery = '' }: SearchPaletteProps) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Article[]>([]);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    if (initialQuery) {
        setQuery(initialQuery);
    }
  }, [initialQuery, open]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (query.length > 1) {
      startTransition(async () => {
        const searchResults = await searchArticles(query);
        setResults(searchResults);
      });
    } else {
      setResults([]);
    }
  }, [query]);

  const handleSelect = (slug: string) => {
    onOpenChange(false);
    setQuery('');
    router.push(`/article/${slug}`);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={cn(
            "sm:max-w-2xl p-0 gap-0 overflow-hidden",
            "bg-background/80 backdrop-blur-sm border-border/50"
        )}
      >
        <DialogTitle className="sr-only">Search</DialogTitle>
        <div className="flex items-center p-4 border-b border-border/50">
          <SearchIcon className="h-5 w-5 mr-3 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles, authors, or tags..."
            className="border-none focus-visible:ring-0 text-base h-auto p-0 bg-transparent"
          />
        </div>
        <div className="p-4 h-96 overflow-y-auto">
            {isPending ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Searching...</span>
                </div>
            ) : query.length > 1 && results.length === 0 ? (
                <div className="text-center text-muted-foreground py-16">
                    <p>No results found for &quot;{query}&quot;.</p>
                </div>
            ) : results.length > 0 ? (
                 <div className="flex flex-col gap-2">
                    {results.map((article) => (
                        <div
                            key={article.id}
                            onClick={() => handleSelect(article.slug)}
                            className="p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors flex items-start gap-4"
                        >
                            <Avatar className="h-10 w-10 border">
                                <AvatarImage src={article.authorAvatarUrl} alt={article.authorName} />
                                <AvatarFallback>{article.authorName?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <h3 className="font-semibold mb-1">{highlightText(article.title, query)}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                  By {highlightText(article.authorName || '', query)}
                                </p>
                                <div className="flex flex-wrap gap-1">
                                    {article.tags.map(tag => (
                                        <Badge key={tag.id} variant="secondary" className="text-xs">
                                          {highlightText(tag.name, query)}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center text-muted-foreground py-16 flex flex-col items-center gap-4">
                    <File className="h-8 w-8" />
                    <p>Start typing to see search results.</p>
                </div>
            )}
        </div>
         <div className="flex items-center justify-end gap-2 p-3 border-t bg-muted/50 text-xs text-muted-foreground">
            <span className="font-semibold">Tip:</span>
            <span>Use</span>
            <kbd className="flex items-center gap-1 rounded border bg-background px-2 py-1 font-mono">
              <span>⌘</span>K
            </kbd>
            <span>to open search anytime.</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
