
'use client';

import { useState, useTransition } from 'react';
import type { Article } from '@/lib/definitions';
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
import { MoreHorizontal, Pencil, Trash2, Eye, EyeOff, ExternalLink } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
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
import { useToast } from '@/hooks/use-toast';
import { deleteArticle, updateArticleVisibility } from '@/lib/actions';
import { useRouter } from 'next/navigation';
import { Badge } from './ui/badge';

export function MyArticlesClient({ articles }: { articles: Article[] }) {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [articleToDelete, setArticleToDelete] = useState<Article | null>(null);
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const router = useRouter();

    const openDeleteDialog = (article: Article) => {
        setArticleToDelete(article);
        setIsDeleteDialogOpen(true);
    };

    const handleDelete = () => {
        if (!articleToDelete) return;

        startTransition(async () => {
            try {
                await deleteArticle(articleToDelete.id);
                toast({
                    title: 'Article Deleted',
                    description: `"${articleToDelete.title}" has been successfully deleted.`,
                });
            } catch (error: any) {
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: error.message || "Could not delete the article.",
                });
            } finally {
                setIsDeleteDialogOpen(false);
                setArticleToDelete(null);
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

    const getStatus = (article: Article) => {
        if (!article.publishedAt) {
            return { text: 'Draft', variant: 'secondary' as const };
        }
        if (article.visibility === 'private') {
            return { text: 'Private', variant: 'outline' as const };
        }
        return { text: 'Published', variant: 'default' as const };
    }

    return (
        <>
            <div className="border rounded-lg">
                <Table>
                     {!articles.length && (
                        <TableCaption>You haven't published any articles yet.</TableCaption>
                    )}
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Publication Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {articles.map((article) => {
                            const status = getStatus(article);
                            return (
                                <TableRow key={article.id}>
                                    <TableCell className="font-medium">{article.title}</TableCell>
                                    <TableCell>
                                        <Badge variant={status.variant}>
                                            {status.text}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('en-CA') : 'N/A'}
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
                                                <DropdownMenuItem onClick={() => router.push(`/editor/${article.slug}`)}>
                                                    <Pencil className="mr-2 h-4 w-4" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => router.push(`/article/${article.slug}`)} disabled={!article.publishedAt}>
                                                    <ExternalLink className="mr-2 h-4 w-4" />
                                                    Visit
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                {article.visibility === 'private' ? (
                                                  <DropdownMenuItem onClick={() => handleVisibilityChange(article.id!, 'public')} disabled={isPending || !article.publishedAt}>
                                                     <Eye className="mr-2 h-4 w-4" />
                                                     Make Public
                                                  </DropdownMenuItem>
                                                ) : (
                                                  <DropdownMenuItem onClick={() => handleVisibilityChange(article.id!, 'private')} disabled={isPending || !article.publishedAt}>
                                                    <EyeOff className="mr-2 h-4 w-4" />
                                                    Make Private
                                                  </DropdownMenuItem>
                                                )}
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => openDeleteDialog(article)} className="text-destructive">
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </div>
            
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action is irreversible. The article &quot;{articleToDelete?.title}&quot; will be permanently deleted.
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
