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
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { useToast } from '@/hooks/use-toast';
import { deleteArticle } from '@/lib/actions';
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
                    title: 'Article Supprimé',
                    description: `"${articleToDelete.title}" a été supprimé avec succès.`,
                });
            } catch (error: any) {
                toast({
                    variant: 'destructive',
                    title: 'Erreur',
                    description: error.message || "Impossible de supprimer l'article.",
                });
            } finally {
                setIsDeleteDialogOpen(false);
                setArticleToDelete(null);
            }
        });
    };

    return (
        <>
            <div className="border rounded-lg">
                <Table>
                     {!articles.length && (
                        <TableCaption>Vous n'avez pas encore publié d'articles.</TableCaption>
                    )}
                    <TableHeader>
                        <TableRow>
                            <TableHead>Titre</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date de Publication</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {articles.map((article) => (
                            <TableRow key={article.id}>
                                <TableCell className="font-medium">{article.title}</TableCell>
                                <TableCell>
                                    <Badge variant={article.publishedAt ? 'default' : 'secondary'}>
                                        {article.publishedAt ? 'Publié' : 'Brouillon'}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : 'N/A'}
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Ouvrir le menu</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => router.push(`/editor/${article.slug}`)}>
                                                <Pencil className="mr-2 h-4 w-4" />
                                                Modifier
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => openDeleteDialog(article)} className="text-destructive">
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Supprimer
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
                        <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Cette action est irréversible. L'article &quot;{articleToDelete?.title}&quot; sera supprimé définitivement.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} disabled={isPending}>
                            {isPending ? 'Suppression...' : 'Supprimer'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
