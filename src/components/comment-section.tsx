
'use client';

import { useState, useEffect, useTransition, useCallback, useRef } from 'react';
import type { Comment, User } from '@/lib/definitions';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { addComment, getCommentsAction, deleteComment, reportItem } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { MessageCircle, Trash2, Flag } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from './ui/dialog';
import { Label } from './ui/label';

function ReportDialog({ type, itemId, onOpenChange }: { type: 'article' | 'comment', itemId: number, onOpenChange: (open: boolean) => void }) {
    const [reason, setReason] = useState('');
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const handleSubmit = () => {
        if (!reason.trim()) {
            toast({ variant: 'destructive', title: 'Raison requise', description: 'Veuillez fournir une raison pour votre signalement.' });
            return;
        }
        startTransition(async () => {
            try {
                const result = await reportItem(type, itemId, reason);
                if (result.success) {
                    toast({ title: 'Contenu signalé', description: 'Merci. Votre signalement a été envoyé à notre équipe de modération.' });
                    onOpenChange(false);
                } else {
                    throw new Error(result.message);
                }
            } catch (error: any) {
                toast({ variant: 'destructive', title: 'Erreur', description: error.message });
            }
        });
    }

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Signaler ce contenu</DialogTitle>
                <DialogDescription>
                    Veuillez nous indiquer pourquoi vous signalez ce contenu. Les signalements abusifs peuvent entraîner des sanctions.
                </DialogDescription>
            </DialogHeader>
            <div className="mt-4 space-y-2">
                <Label htmlFor="report-reason">Raison du signalement</Label>
                <Textarea 
                    id="report-reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Ex: spam, contenu inapproprié, harcèlement..."
                />
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="secondary">Annuler</Button>
                </DialogClose>
                <Button onClick={handleSubmit} disabled={isPending}>
                    {isPending ? 'Envoi...' : 'Envoyer le signalement'}
                </Button>
            </DialogFooter>
        </DialogContent>
    );
}

const CommentForm = ({ 
    articleId, 
    parentId, 
    onCommentAdded, 
    placeholder = "Write a comment...",
    onCancel,
}: { 
    articleId: number; 
    parentId?: number; 
    onCommentAdded: () => void;
    placeholder?: string;
    onCancel?: () => void;
}) => {
    const [content, setContent] = useState('');
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!content.trim()) return;

        startTransition(async () => {
            try {
                const result = await addComment(articleId, content, parentId);
                if (result.success) {
                    setContent('');
                    onCommentAdded();
                } else {
                    throw new Error(result.message);
                }
            } catch (error: any) {
                toast({
                    variant: "destructive",
                    title: "Failed to post comment",
                    description: error.message,
                });
            }
        });
    };
    
    return (
        <form onSubmit={handleSubmit} className="mb-4">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={placeholder}
              className="mb-2"
              rows={3}
            />
            <div className="flex justify-end gap-2">
                {onCancel && <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>}
                <Button type="submit" disabled={isPending || !content.trim()}>
                    {isPending ? 'Posting...' : 'Post Comment'}
                </Button>
            </div>
        </form>
    );
};


const CommentItem = ({ comment, articleId, user, onCommentChange }: { comment: Comment; articleId: number; user: User | null, onCommentChange: () => void }) => {
    const [isReplying, setIsReplying] = useState(false);
    const { toast } = useToast();
    const [isDeleting, startDeleteTransition] = useTransition();
    const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);

    const canDelete = user && (user.id === comment.authorId || user.role === 'ADMIN' || user.role === 'MODERATOR');

    const handleDelete = () => {
        if (!canDelete) return;

        startDeleteTransition(async () => {
            try {
                const result = await deleteComment(comment.id);
                if (result.success) {
                    toast({ title: "Comment deleted" });
                    onCommentChange();
                } else {
                    throw new Error(result.message);
                }
            } catch (error: any) {
                toast({ variant: 'destructive', title: 'Error', description: error.message });
            }
        });
    }

    return (
        <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
            <div className="flex flex-col">
                <div className="flex gap-4">
                    <Link href={`/profile/${encodeURIComponent(comment.authorName || '')}`}>
                        <Avatar>
                            <AvatarImage src={comment.authorAvatarUrl} alt={comment.authorName} />
                            <AvatarFallback>{comment.authorName?.charAt(0)}</AvatarFallback>
                        </Avatar>
                    </Link>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <Link href={`/profile/${encodeURIComponent(comment.authorName || '')}`} className="font-semibold hover:underline">{comment.authorName}</Link>
                            <span className="text-xs text-muted-foreground">
                                &middot; {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                        <p className="text-foreground/90">{comment.content}</p>
                        <div className="flex items-center gap-2 mt-2">
                            {user && (
                                <>
                                    <Button variant="ghost" size="sm" onClick={() => setIsReplying(!isReplying)}>
                                        <MessageCircle className="mr-2 h-4 w-4" />
                                        Reply
                                    </Button>
                                    <DialogTrigger asChild>
                                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive">
                                            <Flag className="mr-2 h-4 w-4" />
                                            Signaler
                                        </Button>
                                    </DialogTrigger>
                                </>
                            )}
                            {canDelete && (
                                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={handleDelete} disabled={isDeleting}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    {isDeleting ? 'Deleting...' : 'Delete'}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {isReplying && user && (
                     <div className="pl-8 pt-4">
                        <CommentForm 
                            articleId={articleId} 
                            parentId={comment.id}
                            onCommentAdded={() => {
                                setIsReplying(false);
                                onCommentChange();
                            }}
                            placeholder={`Replying to ${comment.authorName}...`}
                            onCancel={() => setIsReplying(false)}
                        />
                    </div>
                )}
                
                {comment.children && comment.children.length > 0 && (
                    <div className="pl-8 pt-4 border-l border-border/50 ml-6">
                        {comment.children.map(child => (
                            <CommentItem key={child.id} comment={child} articleId={articleId} user={user} onCommentChange={onCommentChange} />
                        ))}
                    </div>
                )}
            </div>
            <ReportDialog type="comment" itemId={comment.id} onOpenChange={setIsReportDialogOpen} />
        </Dialog>
    );
};


export function CommentSection({ articleId, user }: { articleId: number; user: User | null }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [totalComments, setTotalComments] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const countComments = (comments: Comment[]): number => {
    let count = comments.length;
    for (const comment of comments) {
        if (comment.children) {
            count += countComments(comment.children);
        }
    }
    return count;
  };

  const fetchComments = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedComments = await getCommentsAction(articleId);
      setComments(fetchedComments);
      setTotalComments(countComments(fetchedComments));
    } catch (error) {
      console.error("Failed to fetch comments", error);
      toast({
        variant: "destructive",
        title: "Failed to load comments",
        description: "Please try refreshing the page.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [articleId, toast]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);
  
  return (
    <section>
      <h2 className="text-2xl font-bold mb-6">Comments ({totalComments})</h2>
      
      {user ? (
        <CommentForm articleId={articleId} onCommentAdded={fetchComments} />
      ) : (
        <div className="text-center p-4 border rounded-md bg-muted/50">
            <p>Please <Link href="/login" className="underline font-semibold">log in</Link> to post a comment.</p>
        </div>
      )}

      <div className="space-y-6 mt-8">
        {isLoading ? (
          <p>Loading comments...</p>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} articleId={articleId} user={user} onCommentChange={fetchComments} />
          ))
        ) : (
          <p className="text-muted-foreground">No comments yet. Be the first to share your thoughts!</p>
        )}
      </div>
    </section>
  );
}
