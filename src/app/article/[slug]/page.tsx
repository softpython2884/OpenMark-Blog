import { getArticleBySlug } from '@/lib/data';
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

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const user = await getUser();
  const article = await getArticleBySlug(params.slug, user?.id);

  if (!article) {
    notFound();
  }
  
  const readingTime = calculateReadingTime(article.content);

  const formatReadingTime = (time: number) => {
    if (time < 1) return "Less than 1 min read";
    return `${time} min read`;
  }

  return (
    <article className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <header className="mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            {article.tags.map(tag => (
              <Badge key={tag.id} variant="secondary">{tag.name}</Badge>
            ))}
          </div>
          <h1 className="text-4xl md:text-5xl font-headline font-bold leading-tight mb-4">{article.title}</h1>
          <div className="flex items-center gap-4 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={article.authorAvatarUrl} alt={article.authorName} />
                <AvatarFallback>{article.authorName?.charAt(0)}</AvatarFallback>
              </Avatar>
              <span>{article.authorName}</span>
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
