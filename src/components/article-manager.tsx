
'use client';

import { useState, useTransition } from 'react';
import type { Article } from '@/lib/definitions';
import { setFeaturedArticle, deleteArticle, updateArticleVisibility } from '@/lib/actions';
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
import { Star, MoreHorizontal, Trash2, EyeOff, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from './ui/badge';

export function ArticleManager({ articles }: { articles: Partial<Article>[] }) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [articleToAction, setArticleToAction] = useState<Partial<Article> | null>(null);

  const handleSetFeatured = (articleId: number, currentStatus: boolean) => {
    startTransition(async () => {
      try {
        await setFeaturedArticle(articleId, !currentStatus);
        toast({ title: 'Success', description: 'Featured article updated.' });
      } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
      }
    });
  };

  const openDeleteDialog = (article: Partial<Article>) => {
    setArticleToAction(article);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (!articleToAction) return;

    startTransition(async () => {
      try {
        await deleteArticle(articleToAction.id!);
        toast({ title: 'Article Deleted', description: `"${articleToAction.title}" has been deleted.` });
      } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
      } finally {
        setIsDeleteDialogOpen(false);
        setArticleToAction(null);
      }
    });
  };
  
  const handleVisibilityChange = (articleId: number, newVisibility: 'public' | 'private') => {
     startTransition(async () => {
      try {
        await updateArticleVisibility(articleId, newVisibility);
        toast({ title: 'Success', description: 'Article visibility updated.' });
      } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
      }
    });
  };

  return (
    <>
      <div className="border rounded-lg">
        <Table>
          {!articles.length && (
              <TableCaption>No articles published yet.</TableCaption>
          )}
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {articles.map((article) => (
              <TableRow key={article.id} className={cn(article.isFeatured && 'bg-accent/50')}>
                <TableCell className="font-medium">{article.title}</TableCell>
                <TableCell>{article.authorName}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {article.isFeatured && <Badge variant="default">Featured</Badge>}
                    {article.visibility === 'private' && <Badge variant="secondary">Private</Badge>}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleSetFeatured(article.id!, !!article.isFeatured)} disabled={isPending}>
                           <Star className="mr-2 h-4 w-4" />
                           {article.isFeatured ? 'Unfeature' : 'Feature'}
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator />

                        {article.visibility === 'private' ? (
                          <DropdownMenuItem onClick={() => handleVisibilityChange(article.id!, 'public')} disabled={isPending}>
                             <Eye className="mr-2 h-4 w-4" />
                             Make Public
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleVisibilityChange(article.id!, 'private')} disabled={isPending}>
                            <EyeOff className="mr-2 h-4 w-4" />
                            Make Private
                          </DropdownMenuItem>
                        )}
                        
                        <DropdownMenuSeparator />

                        <DropdownMenuItem onClick={() => openDeleteDialog(article)} className="text-destructive" disabled={isPending}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

       <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                      This action is irreversible. The article &quot;{articleToAction?.title}&quot; will be permanently deleted.
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} disabled={isPending}>
                      {isPending ? 'Deleting...' : 'Delete'}
                  </AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
