'use client';

import { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface SearchPaletteProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SearchPalette({ open, onOpenChange }: SearchPaletteProps) {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 gap-0">
        <DialogTitle className="sr-only">Search</DialogTitle>
        <div className="flex items-center p-4 border-b">
          <Search className="h-5 w-5 mr-3 text-muted-foreground" />
          <Input
            placeholder="Search articles, authors, or tags..."
            className="border-none focus-visible:ring-0 text-base h-auto p-0"
          />
        </div>
        <div className="p-4 h-96 overflow-y-auto">
            {/* Placeholder for search results */}
            <div className="text-center text-muted-foreground py-16">
                <p>Start typing to see search results.</p>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
