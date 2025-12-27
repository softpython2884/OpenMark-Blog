
'use client';

import { useState } from 'react';
import type { Article, User } from '@/lib/definitions';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Search, Clock, Rss, ChevronsRight } from 'lucide-react';
import Image from 'next/image';
import { placeholderImages } from '@/lib/placeholder-images';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SearchPalette } from '@/components/search-palette';
import { calculateReadingTime } from '@/lib/utils';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';

const createSnippet = (html: string, length: number) => {
  if (!html) return '';
  const text = html.replace(/<[^>]+>/g, '').trim();
  if (text.length <= length) return text;
  const truncated = text.substring(0, length);
  return truncated.substring(0, Math.min(truncated.length, truncated.lastIndexOf(' '))) + '...';
};

const formatReadingTime = (time: number) => {
    if (time < 1) return "Less than 1 min";
    if (time % 1 === 0) return `${time} min read`;
    if ((time * 10) % 10 === 5) return `${time.toFixed(1)} min read`;
    return `${time.toFixed(2)} min read`;
}

const ArticleCardGrid = ({ article, index }: { article: Article, index: number }) => {
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
          <div className="w-full flex justify-between items-end">
              <div className="flex flex-wrap gap-2">
                  {article.tags.slice(0, 2).map(tag => (
                      <Badge key={tag.id} variant="secondary">{tag.name}</Badge>
                  ))}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Link href={`/profile/${encodeURIComponent(article.authorName || '')}`} className="hover:underline flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={article.authorAvatarUrl} alt={article.authorName} />
                        <AvatarFallback>{article.authorName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="hidden sm:block">
                        <span className="font-semibold text-foreground">{article.authorName}</span>
                        <div className="text-xs">{new Date(article.publishedAt!).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</div>
                    </div>
                  </Link>
              </div>
          </div>
        </CardFooter>
      </Card>
    );
};

const ArticleCardList = ({ article, index }: { article: Article, index: number }) => {
    const readingTime = calculateReadingTime(article.content);
    return (
        <Card key={article.id} className="group overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 w-full">
            <div className={`flex flex-col ${index % 2 === 0 ? 'sm:flex-row' : 'sm:flex-row-reverse'}`}>
                <Link href={`/article/${article.slug}`} className="relative w-full sm:w-2/5 aspect-video shrink-0 block">
                    <Image
                      src={article.imageUrl || placeholderImages[(index + 1) % placeholderImages.length].imageUrl}
                      alt={article.title}
                      fill
                      className="object-cover"
                      data-ai-hint={placeholderImages[(index + 1) % placeholderImages.length].imageHint}
                    />
                </Link>
                <div className="flex flex-col flex-1 p-6">
                    <Link href={`/article/${article.slug}`}>
                        <CardTitle className="font-headline text-2xl leading-tight mb-2 group-hover:text-primary transition-colors">{article.title}</CardTitle>
                    </Link>
                    <p className="text-muted-foreground text-sm mb-4 flex-grow">{article.summary || createSnippet(article.content, 120)}</p>
                    <div className="flex justify-between items-end text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Link href={`/profile/${encodeURIComponent(article.authorName || '')}`} className="hover:underline flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={article.authorAvatarUrl} alt={article.authorName} />
                                    <AvatarFallback>{article.authorName?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <span className="font-semibold text-foreground">{article.authorName}</span>
                                    <div className="text-xs">{new Date(article.publishedAt!).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</div>
                                </div>
                            </Link>
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatReadingTime(readingTime)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export function HomePageClient({ user, articles, followedArticles, recommendedArticles }: { user: User | null, articles: Article[], followedArticles: Article[], recommendedArticles: Article[] }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  const heroArticle = articles.length > 0 ? articles.find(a => a.isFeatured) || articles[0] : null;
  const otherArticles = heroArticle ? articles.filter(a => a.id !== heroArticle.id) : articles;

  const userFeed = [...followedArticles];
  const followedArticleIds = new Set(followedArticles.map(a => a.id));
  recommendedArticles.forEach(rec => {
      if (!followedArticleIds.has(rec.id)) {
          userFeed.push(rec);
      }
  });

  return (
    <div className="container mx-auto px-4 py-8 space-y-16">
      
      {heroArticle && (
        <section className="w-full">
            <div className="relative h-[60vh] md:h-[70vh] w-full rounded-2xl overflow-hidden flex items-center justify-center text-white">
                <Image
                    src={heroArticle.imageUrl || placeholderImages[0].imageUrl}
                    alt={heroArticle.title}
                    fill
                    priority
                    className="object-cover"
                    data-ai-hint={placeholderImages[0].imageHint}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
                <div className="relative z-10 max-w-4xl p-8 text-center flex flex-col items-center">
                    {heroArticle.tags.length > 0 && (
                        <Badge variant="secondary" className="mb-4 text-sm">{heroArticle.tags[0].name}</Badge>
                    )}
                    <h1 className="text-4xl md:text-6xl font-headline font-bold leading-tight mb-4 text-shadow-lg">
                       <Link href={`/article/${heroArticle.slug}`}>{heroArticle.title}</Link>
                    </h1>
                    <div className="flex items-center gap-4 text-lg mb-6">
                        <div className="flex items-center gap-2">
                           <Link href={`/profile/${encodeURIComponent(heroArticle.authorName || '')}`} className="flex items-center gap-2 hover:underline">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={heroArticle.authorAvatarUrl} alt={heroArticle.authorName} />
                                <AvatarFallback>{heroArticle.authorName?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span>{heroArticle.authorName}</span>
                           </Link>
                        </div>
                        <span>&middot;</span>
                        <time dateTime={heroArticle.publishedAt!}>
                            {new Date(heroArticle.publishedAt!).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </time>
                    </div>
                    <Button asChild size="lg">
                        <Link href={`/article/${heroArticle.slug}`}>
                            Read Article <ArrowRight className="ml-2" />
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
      )}

      <section>
        <Button 
          variant="outline" 
          className="w-full max-w-2xl mx-auto h-12 text-muted-foreground flex justify-between items-center"
          onClick={() => setIsSearchOpen(true)}
        >
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            <span>Search by title, author, tag...</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-1 rounded border bg-muted px-2 py-1 text-xs font-mono">
            <span>⌘</span>K
          </kbd>
        </Button>
      </section>
      
      {userFeed.length > 0 && (
        <section>
          <h2 className="text-3xl font-headline font-bold mb-8 flex items-center justify-center gap-3">
              <Rss className="h-7 w-7 text-primary" />
              Your Feed
          </h2>
          <Carousel opts={{ align: 'start', loop: false }} className="w-full">
            <CarouselContent>
              {userFeed.map((article, index) => (
                <CarouselItem key={`feed-${article.id}`} className="basis-full md:basis-1/2 lg:basis-1/3">
                    <div className="p-1">
                        <ArticleCardGrid article={article} index={index} />
                    </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
           <div className="mt-4 flex md:hidden items-center justify-center text-sm text-muted-foreground animate-pulse">
                <ChevronsRight className="h-4 w-4 mr-2" />
                <span>Swipe to see more</span>
            </div>
        </section>
      )}

      <section>
        <div className="text-center mb-8">
            <h1 className="text-4xl font-headline font-bold">Latest Articles</h1>
        </div>

        {articles.length === 0 ? (
          <div className="text-center py-16 px-4 border-2 border-dashed rounded-lg bg-muted/20">
              {/* Content for no articles */}
          </div>
        ) : (
            <>
                <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {otherArticles.map((article, index) => (
                        <ArticleCardGrid key={`grid-${article.id}`} article={article} index={index} />
                    ))}
                </div>
                <div className="grid md:hidden grid-cols-1 gap-6">
                     {otherArticles.map((article, index) => (
                        <ArticleCardList key={`list-${article.id}`} article={article} index={index} />
                    ))}
                </div>
            </>
        )}
      </section>

      <SearchPalette open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </div>
  );
}
