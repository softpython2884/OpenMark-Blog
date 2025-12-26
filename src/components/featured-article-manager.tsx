'use client';

import { useTransition } from 'react';
import type { Article } from '@/lib/definitions';
import { setFeaturedArticle } from '@/lib/actions';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export function FeaturedArticleManager({ articles }: { articles: Partial<Article>[] }) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleSetFeatured = (articleId: number) => {
    startTransition(async () => {
      try {
        const result = await setFeaturedArticle(articleId);
        if (result.success) {
            toast({
                title: 'Success',
                description: 'Featured article updated successfully.',
            });
        } else {
            throw new Error('An unknown error occurred.');
        }
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.message,
        });
      }
    });
  };

  return (
    <div className="border rounded-lg">
      <Table>
        {!articles.length && (
            <TableCaption>No articles published yet to feature.</TableCaption>
        )}
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Author</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {articles.map((article) => (
            <TableRow key={article.id} className={cn(article.isFeatured && 'bg-accent/50')}>
              <TableCell className="font-medium">{article.title}</TableCell>
              <TableCell>{article.authorName}</TableCell>
              <TableCell className="text-right">
                <Button
                    size="sm"
                    variant={article.isFeatured ? "default" : "outline"}
                    onClick={() => handleSetFeatured(article.id!)}
                    disabled={isPending}
                >
                    <Star className="mr-2 h-4 w-4" />
                    {article.isFeatured ? 'Featured' : 'Feature'}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
