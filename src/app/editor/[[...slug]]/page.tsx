import { EditorForm } from '@/components/editor-form';
import { getUser } from '@/lib/auth';
import { getArticleBySlug } from '@/lib/data';
import { notFound, redirect } from 'next/navigation';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Article Editor',
};

export default async function EditorPage({ params }: { params: { slug?: string[] } }) {
  const user = await getUser();
  if (!user || !['ADMIN', 'EDITOR', 'AUTHOR'].includes(user.role)) {
    redirect('/login');
  }

  const slug = params.slug?.[0];
  let article = null;

  if (slug) {
    article = await getArticleBySlug(slug, user.id);
    if (!article) {
      notFound();
    }
    // Authorization check
    if (user.role !== 'ADMIN' && user.role !== 'EDITOR' && article.authorId !== user.id) {
        // You can redirect or show an error message
        redirect('/');
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-headline font-bold mb-8">
          {article ? 'Edit Article' : 'Create New Article'}
        </h1>
        <EditorForm article={article} />
      </div>
    </div>
  );
}
