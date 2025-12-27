
import { getArticleByShareToken } from '@/lib/data';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CommentSection } from '@/components/comment-section';
import { getUser } from '@/lib/auth';
import { ArticleActions } from '@/components/article-actions';
import Image from 'next/image';
import { placeholderImages } from '@/lib/placeholder-images';
import { ArticleRenderer } from '@/components/article-renderer';
import { calculateReadingTime } from '@/lib/utils';
import { Clock } from 'lucide-react';
import Link from 'next/link';
import { Metadata, ResolvingMetadata } from 'next';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Eye } from 'lucide-react';

type Props = {
  params: { token: string };
};

export async function generateMetadata({ params }: Props, parent: ResolvingMetadata): Promise<Metadata> {
  const article = await getArticleByShareToken(params.token);
  if (!article) return { title: 'Private Article', robots: { index: false, follow: false } };

  const previousImages = (await parent).openGraph?.images || []

  return { 
    title: `[Private] ${article.title}`, 
    robots: { index: false, follow: false },
    openGraph: {
        title: `[Private] ${article.title}`,
        description: article.summary || '',
        images: [article.imageUrl || placeholderImages[article.id % placeholderImages.length].imageUrl, ...previousImages],
    },
    twitter: {
      card: 'summary_large_image',
      title: `[Private] ${article.title}`,
      description: article.summary || '',
      images: [article.imageUrl || placeholderImages[article.id % placeholderImages.length].imageUrl],
    },
  };
}

export default async function PrivateArticlePage({ params }: { params: { token: string } }) {
  const user = await getUser();
  const article = await getArticleByShareToken(params.token);

  if (!article) {
    notFound();
  }
  
  const readingTime = calculateReadingTime(article.content);

  const formatReadingTime = (time: number) => {
    if (time < 1) return "Less than 1 min read";
    if (time % 1 === 0) return `${time} min read`;
    if ((time * 10) % 10 === 5) return `${time.toFixed(1)} min read`;
    return `${time.toFixed(2)} min read`;
  }

  return (
    <article className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <Alert variant="default" className="mb-8 bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950 dark:border-amber-900/50 dark:text-amber-200">
            <Eye className="h-4 w-4 !text-amber-500" />
            <AlertTitle>Private Preview</AlertTitle>
            <AlertDescription>
                This is a private link for a non-public article. Please do not share it widely.
            </AlertDescription>
        </Alert>

        <header className="mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            {article.tags.map(tag => (
              <Badge key={tag.id} variant="secondary">{tag.name}</Badge>
            ))}
          </div>
          <h1 className="text-4xl md:text-5xl font-headline font-bold leading-tight mb-4">{article.title}</h1>
          <div className="flex items-center gap-4 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Link href={`/profile/${encodeURIComponent(article.authorName || '')}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={article.authorAvatarUrl} alt={article.authorName} />
                  <AvatarFallback>{article.authorName?.charAt(0)}</AvatarFallback>
                </Avatar>
                <span>{article.authorName}</span>
              </Link>
            </div>
            <span>&middot;</span>
            <time dateTime={article.publishedAt!}>{new Date(article.publishedAt!).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
            <span>&middot;</span>
            <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span>
                    {formatReadingTime(readingTime)}
                </span>
            </div>
          </div>
        </header>

        <div className="relative w-full aspect-video mb-8">
            <Image 
                src={article.imageUrl || placeholderImages[article.id % placeholderImages.length].imageUrl}
                alt={article.title}
                fill
                className="object-cover rounded-lg"
                data-ai-hint={placeholderImages[article.id % placeholderImages.length].imageHint}
                priority
            />
        </div>

        {article.summary && (
          <div className="bg-accent/50 border-l-4 border-accent p-6 rounded-r-lg mb-8">
            <h2 className="text-lg font-semibold mb-2">TL;DR</h2>
            <p className="text-accent-foreground/80">{article.summary}</p>
          </div>
        )}

        <ArticleRenderer content={article.content} />

        <Separator className="my-12" />
        
        <ArticleActions articleId={article.id} initialLikes={article.likes} initialIsLiked={!!article.isLiked} />
        
        <Separator className="my-12" />

        <CommentSection articleId={article.id} user={user} />
      </div>
    </article>
  );
}
