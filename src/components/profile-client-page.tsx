'use client';

import type { Article, User, BadgeInfo } from '@/lib/definitions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AtSign, Calendar, Edit, FileText, Sparkles, TrendingUp, MessageCircle, ThumbsUp, Star, UserPlus, UserCheck } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { placeholderImages } from '@/lib/placeholder-images';
import { calculateReadingTime } from '@/lib/utils';
import { Clock } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { CircularProgress } from './ui/circular-progress';
import { useState, useTransition } from 'react';
import { toggleFollow } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';


const createSnippet = (html: string, length: number) => {
  if (!html) return '';
  const text = html.replace(/<[^>]+>/g, '').trim();
  if (text.length <= length) {
    return text;
  }
  const truncated = text.substring(0, length);
  return truncated.substring(0, Math.min(truncated.length, truncated.lastIndexOf(' '))) + '...';
};

const TopArticleCard = ({ article, reason }: { article: Article, reason: string }) => {
    const readingTime = calculateReadingTime(article.content);
    
    const reasonConfig = {
        'Latest': { icon: Sparkles, text: 'Latest Post', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' },
        'Most Liked': { icon: ThumbsUp, text: 'Most Liked', className: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' },
        'Most Commented': { icon: MessageCircle, text: 'Most Commented', className: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' },
    }[reason] || { icon: Star, text: reason, className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' };

    const ReasonIcon = reasonConfig.icon;

    return (
        <Card className="flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative group overflow-hidden">
            <Badge className={`absolute top-3 right-3 z-10 ${reasonConfig.className}`}>
                <ReasonIcon className="mr-1.5 h-3.5 w-3.5" />
                {reasonConfig.text}
            </Badge>
            <Link href={`/article/${article.slug}`} className="block">
                <CardHeader className="p-0">
                    <div className="relative aspect-video w-full overflow-hidden">
                        <Image
                            src={article.imageUrl || placeholderImages.find(p => p.id === '1')!.imageUrl}
                            alt={article.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            data-ai-hint={placeholderImages.find(p => p.id === '1')!.imageHint}
                        />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                    </div>
                </CardHeader>
                <CardContent className="flex-grow p-4">
                    <CardTitle className="font-headline text-xl leading-tight mb-2">{article.title}</CardTitle>
                </CardContent>
            </Link>
        </Card>
    )
}

const UserBadge = ({ badge }: { badge: BadgeInfo }) => {
    const Icon = badge.icon;
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="p-2 bg-accent/50 rounded-full cursor-pointer">
                        <Icon className="h-5 w-5 text-accent-foreground/80" />
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p className="font-bold">{badge.name}</p>
                    <p className="text-sm text-muted-foreground">{badge.description}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
};

export function ProfileClientPage({ user, articles, topArticles, loggedInUser }: { user: User & { isFollowing?: boolean }, articles: Article[], topArticles: Array<Article & { reason: string }>, loggedInUser: (User & { userId: number }) | null }) {
  const { toast } = useToast();
  const isOwnProfile = loggedInUser?.id === user.id;
  const [isFollowing, setIsFollowing] = useState(user.isFollowing || false);
  const [isPending, startTransition] = useTransition();

  const handleFollow = () => {
    if (!loggedInUser) {
        toast({
            variant: 'destructive',
            title: 'Not logged in',
            description: 'You must be logged in to follow an author.',
        });
        return;
    }

    startTransition(async () => {
        try {
            const result = await toggleFollow(user.id);
            if (result.success) {
                setIsFollowing(result.following!);
                toast({
                    title: result.following ? 'Followed!' : 'Unfollowed',
                    description: `You are now ${result.following ? 'following' : 'no longer following'} ${user.name}.`,
                });
            } else {
                throw new Error(result.message);
            }
        } catch (error: any) {
             toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message,
            });
        }
    });
  }

  const formatReadingTime = (time: number) => {
    if (time < 1) return "Less than 1 min";
    if (time % 1 === 0) {
        return `${time} min read`;
    }
    if ((time * 10) % 10 === 5) {
        return `${time.toFixed(1)} min read`;
    }
    return `${time.toFixed(2)} min read`;
  }
  
  const regularArticles = articles.filter(article => !topArticles.some(top => top.id === article.id));


  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-12">
        <Card className="p-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
             <div className="relative flex flex-col items-center gap-4">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                       <div className="relative h-28 w-28 flex items-center justify-center">
                          <CircularProgress value={user.levelProgress} className="absolute inset-0 m-auto" />
                          <Avatar className="h-20 w-20">
                              <AvatarImage src={user.avatarUrl} alt={user.name} />
                              <AvatarFallback className="text-3xl">{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                       </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                        <p>{user.score} XP ({user.levelProgress}% to next level)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-4 mb-2">
                <h1 className="text-4xl font-headline font-bold">{user.name}</h1>
                {user.level !== undefined && (
                  <Badge variant="outline" className="text-lg">Level {user.level}</Badge>
                )}
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                <Badge variant="secondary" className="text-md">{user.role}</Badge>
                {user.badges?.map(badge => <UserBadge key={badge.name} badge={badge} />)}
              </div>
               {user.bio && (
                  <p className="text-muted-foreground text-center md:text-left max-w-prose mt-4">{user.bio}</p>
                )}
              <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-4 mt-4 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>{articles.length} {articles.length === 1 ? 'article' : 'articles'} published</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Joined on {new Date(user.registrationDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                {(isOwnProfile || user.isEmailPublic) && user.email && (
                  <div className="flex items-center gap-2">
                    <AtSign className="h-4 w-4" />
                    <a href={`mailto:${user.email}`} className="hover:underline">{user.email}</a>
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-4 items-center">
                 {isOwnProfile ? (
                    <Button variant="outline" asChild>
                      <Link href="/profile/edit">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Profile
                      </Link>
                    </Button>
                ) : loggedInUser && (
                     <Button variant={isFollowing ? 'secondary' : 'default'} onClick={handleFollow} disabled={isPending}>
                        {isFollowing ? (
                            <><UserCheck className="mr-2 h-4 w-4" /> Following</>
                        ) : (
                            <><UserPlus className="mr-2 h-4 w-4" /> Follow</>
                        )}
                    </Button>
                )}
            </div>
          </div>
        </Card>
      </header>

      <main>
        {topArticles && topArticles.length > 0 && (
            <section className="mb-12">
                <h2 className="text-3xl font-headline font-bold mb-6 flex items-center gap-3">
                    <TrendingUp className="h-8 w-8 text-primary" />
                    Top Articles
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {topArticles.map(article => (
                        <TopArticleCard key={`top-${article.id}`} article={article} reason={article.reason} />
                    ))}
                </div>
            </section>
        )}

        <h2 className="text-3xl font-headline font-bold mb-8">All Published Articles</h2>
        {articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {regularArticles.map((article, index) => {
              const readingTime = calculateReadingTime(article.content);
              return (
                <Card key={article.id} className="flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <Link href={`/article/${article.slug}`} className="block group">
                    <CardHeader className="p-0">
                      <div className="relative aspect-video w-full overflow-hidden rounded-t-lg">
                        <Image
                          src={article.imageUrl || placeholderImages[(index + 1) % placeholderImages.length].imageUrl}
                          alt={article.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          data-ai-hint={placeholderImages[(index + 1) % placeholderImages.length].imageHint}
                        />
                      </div>
                    </CardHeader>
                    <CardContent className="flex-grow p-6 relative">
                        <CardTitle className="font-headline text-2xl leading-tight mb-3">{article.title}</CardTitle>
                        <div className="relative h-24 overflow-hidden">
                            <p className="text-muted-foreground text-sm">
                            {article.summary || createSnippet(article.content, 150)}
                            </p>
                            <div className="absolute bottom-0 left-0 right-0 h-full bg-gradient-to-t from-card via-card/80 to-transparent pointer-events-none" />
                        </div>
                    </CardContent>
                  </Link>
                  <CardFooter className="p-6 pt-2 flex flex-col items-start gap-4">
                    <div className="w-full flex justify-center text-xs text-muted-foreground items-center gap-1 mb-2">
                        <Clock className="h-3 w-3" />
                         <span>
                          {formatReadingTime(readingTime)}
                        </span>
                    </div>
                    <div className="w-full flex justify-end">
                        <div className="flex flex-wrap gap-2">
                            {article.tags.map(tag => (
                                <Badge key={tag.id} variant="secondary">{tag.name}</Badge>
                            ))}
                        </div>
                    </div>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-16 px-4 border-2 border-dashed rounded-lg bg-muted/20">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-6 text-2xl font-semibold text-foreground">No articles published yet</h3>
            <p className="mt-2 text-muted-foreground">{user.name} hasn't published any articles.</p>
          </div>
        )}
      </main>
    </div>
  );
}
