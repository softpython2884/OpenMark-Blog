'use client';

import { useState, useTransition } from 'react';
import { Button } from './ui/button';
import { ThumbsUp, Share2, Twitter, Linkedin, Code2 } from 'lucide-react';
import { toggleLike } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';

export function ArticleActions({ articleId, initialLikes, initialIsLiked }: { articleId: number, initialLikes: number, initialIsLiked: boolean }) {
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [isEmbedDialogOpen, setIsEmbedDialogOpen] = useState(false);

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

  const shareOn = (platform: 'twitter' | 'linkedin') => {
    const url = window.location.href;
    const text = document.title;
    let shareUrl = '';
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
    }
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
        title: 'Link Copied!',
        description: 'Article link has been copied to your clipboard.'
    });
  };

  const iframeCode = `<iframe src="${typeof window !== 'undefined' ? window.location.href : ''}" width="100%" height="600" frameborder="0" allowfullscreen title="${typeof document !== 'undefined' ? document.title : ''}"></iframe>`;

  const handleCopyEmbedCode = () => {
      navigator.clipboard.writeText(iframeCode);
      toast({
          title: 'Embed Code Copied!',
          description: 'The iframe code has been copied to your clipboard.'
      });
      setIsEmbedDialogOpen(false);
  }

  return (
    <div className="flex items-center justify-between">
        <Button variant="outline" onClick={handleLike} disabled={isPending} className={cn(isLiked && 'text-primary border-primary')}>
            <ThumbsUp className="mr-2 h-4 w-4" />
            <span>{likes} {likes === 1 ? 'Like' : 'Likes'}</span>
        </Button>
        
        <Dialog open={isEmbedDialogOpen} onOpenChange={setIsEmbedDialogOpen}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                        <Share2 className="mr-2 h-4 w-4" />
                        Share
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => shareOn('twitter')}>
                        <Twitter className="mr-2 h-4 w-4" />
                        <span>Share on X</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => shareOn('linkedin')}>
                        <Linkedin className="mr-2 h-4 w-4" />
                        <span>Share on LinkedIn</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleCopyLink}>
                        <Share2 className="mr-2 h-4 w-4" />
                        <span>Copy Link</span>
                    </DropdownMenuItem>
                    <DialogTrigger asChild>
                        <DropdownMenuItem>
                            <Code2 className="mr-2 h-4 w-4" />
                            <span>Embed</span>
                        </DropdownMenuItem>
                    </DialogTrigger>
                </DropdownMenuContent>
            </DropdownMenu>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Embed Article</DialogTitle>
                </DialogHeader>
                <div className="mt-4 space-y-2">
                    <Label htmlFor="embed-code">Copy this code to embed the article on your site:</Label>
                    <Textarea
                        id="embed-code"
                        readOnly
                        value={iframeCode}
                        rows={4}
                        className="font-mono text-sm"
                    />
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="secondary">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleCopyEmbedCode}>Copy Code</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
  );
}