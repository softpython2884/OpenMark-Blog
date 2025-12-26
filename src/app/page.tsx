import { getPublishedArticles } from '@/lib/data';
import { getUser } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import Image from 'next/image';
import { placeholderImages } from '@/lib/placeholder-images';
import DOMPurify from 'dompurify';

// Function to create a text-only snippet from HTML content
const createSnippet = (html: string, length: number) => {
  const isBrowser = typeof window !== 'undefined';
  const clean = isBrowser ? DOMPurify.sanitize(html, { ALLOWED_TAGS: [] }) : html.replace(/<[^>]+>/g, '');
  if (clean.length <= length) {
    return clean;
  }
  return clean.substring(0, length);
};


export default async function Home() {
  const user = await getUser();
  const articles = await getPublishedArticles();
  const canCreate = user && ['ADMIN', 'EDITOR', 'AUTHOR'].includes(user.role);

  return (
    <div className="container mx-auto px-4 py-8">
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

      {articles.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <h2 className="text-2xl font-semibold text-muted-foreground">No articles yet</h2>
          <p className="text-muted-foreground mt-2">Be the first one to write something amazing!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article, index) => (
            <Card key={article.id} className="flex flex-col hover:shadow-lg transition-shadow duration-300">
               <Link href={`/article/${article.slug}`} className="block">
                <CardHeader>
                  <div className="relative aspect-video w-full mb-4">
                     <Image
                      src={article.imageUrl || placeholderImages[index % placeholderImages.length].imageUrl}
                      alt={article.title}
                      fill
                      className="rounded-t-lg object-cover"
                      data-ai-hint={placeholderImages[index % placeholderImages.length].imageHint}
                    />
                  </div>
                  <CardTitle className="font-headline text-2xl leading-tight">{article.title}</CardTitle>
                  <div className="text-sm text-muted-foreground pt-2">
                    <span>By {article.authorName}</span> &middot; <span>{new Date(article.publishedAt!).toLocaleDateString()}</span>
                  </div>
                </CardHeader>
              </Link>
              <CardContent className="flex-grow relative overflow-hidden">
                <CardDescription className="h-24">
                  {article.summary || createSnippet(article.content, 150)}
                </CardDescription>
                 <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-card to-transparent pointer-events-none" />
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
    </div>
  );
}
