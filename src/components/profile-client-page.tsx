'use client';

import type { Article, User } from '@/lib/definitions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AtSign, Calendar, Edit, FileText } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { placeholderImages } from '@/lib/placeholder-images';
import { calculateReadingTime } from '@/lib/utils';
import { Clock } from 'lucide-react';


const createSnippet = (html: string, length: number) => {
  if (!html) return '';
  const text = html.replace(/<[^>]+>/g, '').trim();
  if (text.length <= length) {
    return text;
  }
  const truncated = text.substring(0, length);
  return truncated.substring(0, Math.min(truncated.length, truncated.lastIndexOf(' '))) + '...';
};


export function ProfileClientPage({ user, articles, loggedInUser }: { user: User, articles: Article[], loggedInUser: (User & { userId: number }) | null }) {

  const isOwnProfile = loggedInUser?.id === user.id;

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-12">
        <Card className="p-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <Avatar className="h-32 w-32 border-4 border-primary">
              <AvatarImage src={user.avatarUrl} alt={user.name} />
              <AvatarFallback className="text-4xl">{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl font-headline font-bold">{user.name}</h1>
              <Badge variant="outline" className="mt-2 text-md">{user.role}</Badge>
              <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-4 mt-4 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>{articles.length} {articles.length === 1 ? 'article' : 'articles'} published</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Joined on {new Date(user.registrationDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                {isOwnProfile && (
                  <div className="flex items-center gap-2">
                    <AtSign className="h-4 w-4" />
                    <span>{user.email}</span>
                  </div>
                )}
              </div>
            </div>
            {isOwnProfile && (
              <div>
                <Button variant="outline">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              </div>
            )}
          </div>
        </Card>
      </header>

      <main>
        <h2 className="text-3xl font-headline font-bold mb-8">Published Articles</h2>
        {articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article, index) => {
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
                          {(() => {
                            if (readingTime < 1) return "Less than 1 min";
                            const minutes = Math.floor(readingTime);
                            const quarters = Math.round((readingTime - minutes) * 4);
                            if (quarters === 0 || quarters === 4) {
                              return `${minutes} min read`;
                            }
                            return `${minutes}.${quarters * 25} min read`;
                          })()}
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
