'use client';

import { useState, useTransition } from 'react';
import { Button } from './ui/button';
import { ThumbsUp, Share2 } from 'lucide-react';
import { toggleLike } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export function ArticleActions({ articleId, initialLikes, initialIsLiked }: { articleId: number, initialLikes: number, initialIsLiked: boolean }) {
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleLike = async () => {
    startTransition(async () => {
      try {
        const result = await toggleLike(articleId);
        if (result.success) {
          setIsLiked(result.liked!);
          setLikes(prev => result.liked ? prev + 1 : prev - 1);
        } else {
            throw new Error(result.message);
        }
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.message || 'Please log in to like this article.',
        });
      }
    });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
        title: 'Link Copied!',
        description: 'Article link has been copied to your clipboard.'
    });
  };

  return (
    <div className="flex items-center justify-between">
        <Button variant="outline" onClick={handleLike} disabled={isPending} className={cn(isLiked && 'text-primary border-primary')}>
            <ThumbsUp className="mr-2 h-4 w-4" />
            <span>{likes} {likes === 1 ? 'Like' : 'Likes'}</span>
        </Button>
        <Button variant="outline" onClick={handleShare}>
            <Share2 className="mr-2 h-4 w-4" />
            Share
        </Button>
    </div>
  );
}
