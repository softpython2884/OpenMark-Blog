'use client';

import { useState } from 'react';
import type { Article, User } from '@/lib/definitions';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusCircle, ArrowRight, Search } from 'lucide-react';
import Image from 'next/image';
import { placeholderImages } from '@/lib/placeholder-images';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SearchPalette } from '@/components/search-palette';

// Function to create a text-only snippet from HTML content
const createSnippet = (html: string, length: number) => {
  // Replace paragraph tags with newlines to preserve structure
  const textWithLineBreaks = html.replace(/<p>/gi, '').replace(/<\/p>/gi, '\n');
  
  // Strip remaining HTML tags to get clean text
  const cleanText = textWithLineBreaks.replace(/<[^>]+>/g, '').trim();

  if (cleanText.length <= length) {
    return cleanText;
  }
  // Find the last space within the length to avoid cutting words
  const truncatedText = cleanText.substring(0, length);
  return truncatedText.substring(0, Math.min(truncatedText.length, truncatedText.lastIndexOf(' ')));
};

export function HomePageClient({ user, articles }: { user: User | null, articles: Article[] }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const canCreate = user && ['ADMIN', 'EDITOR', 'AUTHOR'].includes(user.role);

  const heroArticle = articles.length > 0 ? articles[0] : null;
  const otherArticles = articles.length > 1 ? articles.slice(1) : [];

  return (
    <div className="container mx-auto px-4 py-8">
      
      {heroArticle && (
        <section className="mb-12 w-full">
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
                           <Avatar className="h-8 w-8">
                                <AvatarImage src={heroArticle.authorAvatarUrl} alt={heroArticle.authorName} />
                                <AvatarFallback>{heroArticle.authorName?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span>{heroArticle.authorName}</span>
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

      <section className="mb-12">
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

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-headline font-bold">Latest Articles</h1>
        {canCreate && (
          <Button asChild>
            <Link href="/editor">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Post
            </Link>
          </Button>
        )}
      </div>

      {otherArticles.length === 0 && !heroArticle ? (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <h2 className="text-2xl font-semibold text-muted-foreground">No articles yet</h2>
          <p className="text-muted-foreground mt-2">Be the first one to write something amazing!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {otherArticles.map((article, index) => (
            <Card key={article.id} className="flex flex-col hover:shadow-lg transition-shadow duration-300">
               <Link href={`/article/${article.slug}`} className="block">
                <CardHeader>
                  <div className="relative aspect-video w-full mb-4">
                     <Image
                      src={article.imageUrl || placeholderImages[(index + 1) % placeholderImages.length].imageUrl}
                      alt={article.title}
                      fill
                      className="rounded-t-lg object-cover"
                      data-ai-hint={placeholderImages[(index + 1) % placeholderImages.length].imageHint}
                    />
                  </div>
                  <CardTitle className="font-headline text-2xl leading-tight">{article.title}</CardTitle>
                  <div className="text-sm text-muted-foreground pt-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={article.authorAvatarUrl} alt={article.authorName} />
                        <AvatarFallback>{article.authorName?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span>By {article.authorName}</span> &middot; <span>{new Date(article.publishedAt!).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                  </div>
                </CardHeader>
              </Link>
              <CardContent className="flex-grow relative overflow-hidden">
                <div className="h-24 whitespace-pre-wrap text-center">
                  {article.summary || createSnippet(article.content, 250)}
                </div>
                 <div className="absolute bottom-0 left-0 right-0 h-full bg-gradient-to-t from-card via-card/80 to-transparent pointer-events-none" />
              </CardContent>
              <CardFooter className="flex-wrap gap-2">
                {article.tags.map(tag => (
                  <Badge key={tag.id} variant="secondary">{tag.name}</Badge>
                ))}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      <SearchPalette open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </div>
  );
}
