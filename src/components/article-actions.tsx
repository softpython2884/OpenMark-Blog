
'use client';

import { useState, useTransition, useEffect } from 'react';
import { Button } from './ui/button';
import { ThumbsUp, Share2, Twitter, Linkedin, Code2, Flag } from 'lucide-react';
import { reportItem, toggleLike } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from '@/components/ui/dialog';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';

function ReportDialog({ type, itemId, onOpenChange }: { type: 'article' | 'comment', itemId: number, onOpenChange: (open: boolean) => void }) {
    const [reason, setReason] = useState('');
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const handleSubmit = () => {
        if (!reason.trim()) {
            toast({ variant: 'destructive', title: 'Reason required', description: 'Please provide a reason for your report.' });
            return;
        }
        startTransition(async () => {
            try {
                const result = await reportItem(type, itemId, reason);
                if (result.success) {
                    toast({ title: 'Content Reported', description: 'Thank you. Your report has been sent to our moderation team.' });
                    onOpenChange(false);
                } else {
                    throw new Error(result.message);
                }
            } catch (error: any) {
                toast({ variant: 'destructive', title: 'Error', description: error.message });
            }
        });
    }

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Report this content</DialogTitle>
                <DialogDescription>
                    Please let us know why you are reporting this content. Abusive reports may lead to sanctions.
                </DialogDescription>
            </DialogHeader>
            <div className="mt-4 space-y-2">
                <Label htmlFor="report-reason">Reason for reporting</Label>
                <Textarea 
                    id="report-reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="E.g., spam, inappropriate content, harassment..."
                />
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="secondary">Cancel</Button>
                </DialogClose>
                <Button onClick={handleSubmit} disabled={isPending}>
                    {isPending ? 'Submitting...' : 'Submit Report'}
                </Button>
            </DialogFooter>
        </DialogContent>
    );
}

export function ArticleActions({ articleId, initialLikes, initialIsLiked }: { articleId: number, initialLikes: number, initialIsLiked: boolean }) {
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [isEmbedDialogOpen, setIsEmbedDialogOpen] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [iframeCode, setIframeCode] = useState('');

  useEffect(() => {
    // This code runs only on the client, after hydration
    const articleUrl = window.location.href;
    const articleTitle = document.title;
    setIframeCode(`<iframe src="${articleUrl}" width="100%" height="600" frameborder="0" allowfullscreen title="${articleTitle}"></iframe>`);
  }, []);


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
        
        <Dialog>
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
                    
                    <DialogTrigger asChild onSelect={(e) => { e.preventDefault(); setIsEmbedDialogOpen(true); }}>
                        <DropdownMenuItem>
                            <Code2 className="mr-2 h-4 w-4" />
                            <span>Embed</span>
                        </DropdownMenuItem>
                    </DialogTrigger>
                    
                    <DropdownMenuSeparator />

                    <DialogTrigger asChild onSelect={(e) => { e.preventDefault(); setIsReportDialogOpen(true); }}>
                        <DropdownMenuItem className="text-destructive">
                            <Flag className="mr-2 h-4 w-4" />
                            <span>Report</span>
                        </DropdownMenuItem>
                     </DialogTrigger>

                </DropdownMenuContent>
            </DropdownMenu>

            {isEmbedDialogOpen && (
                 <DialogContent onInteractOutside={() => setIsEmbedDialogOpen(false)} onEscapeKeyDown={() => setIsEmbedDialogOpen(false)}>
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
                        <Button variant="secondary" onClick={() => setIsEmbedDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleCopyEmbedCode}>Copy Code</Button>
                    </DialogFooter>
                </DialogContent>
            )}

            {isReportDialogOpen && <ReportDialog type="article" itemId={articleId} onOpenChange={setIsReportDialogOpen} />}
        </Dialog>
    </div>
  );
}
