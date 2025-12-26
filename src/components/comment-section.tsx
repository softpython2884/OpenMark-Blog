'use client';

import { useState, useEffect, useTransition, useRef } from 'react';
import { getCommentsByArticleId } from '@/lib/data';
import type { Comment, User } from '@/lib/definitions';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { addComment } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';

export function CommentSection({ articleId, user }: { articleId: number; user: User | null }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [content, setContent] = useState('');
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    async function fetchComments() {
      setIsLoading(true);
      const fetchedComments = await getCommentsByArticleId(articleId);
      setComments(fetchedComments);
      setIsLoading(false);
    }
    fetchComments();
  }, [articleId]);
  
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!content.trim()) return;

    startTransition(async () => {
        try {
            const result = await addComment(articleId, content);
            if(result.success) {
                setContent('');
                const newComments = await getCommentsByArticleId(articleId);
                setComments(newComments);
            } else {
                throw new Error(result.message);
            }
        } catch(error: any) {
            toast({
                variant: "destructive",
                title: "Failed to post comment",
                description: error.message,
            });
        }
    });
  };

  return (
    <section>
      <h2 className="text-2xl font-bold mb-6">Comments ({comments.length})</h2>
      
      {user ? (
        <form onSubmit={handleSubmit} ref={formRef} className="mb-8">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write a comment..."
              className="mb-2"
              rows={4}
            />
            <div className="flex justify-end">
                <Button type="submit" disabled={isPending || !content.trim()}>
                    {isPending ? 'Posting...' : 'Post Comment'}
                </Button>
            </div>
        </form>
      ) : (
        <div className="text-center p-4 border rounded-md bg-muted/50">
            <p>Please <a href="/login" className="underline font-semibold">log in</a> to post a comment.</p>
        </div>
      )}

      <div className="space-y-6">
        {isLoading ? (
          <p>Loading comments...</p>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-4">
              <Avatar>
                <AvatarImage src={comment.authorAvatarUrl} alt={comment.authorName} />
                <AvatarFallback>{comment.authorName?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold">{comment.authorName}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p>{comment.content}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-muted-foreground">No comments yet. Be the first to share your thoughts!</p>
        )}
      </div>
    </section>
  );
}
