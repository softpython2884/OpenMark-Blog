import { getPublishedArticles } from '@/lib/data';
import { getUser } from '@/lib/auth';
import { HomePageClient } from '@/components/home-page-client';

export default async function Home() {
  const user = await getUser();
  const articles = await getPublishedArticles();

  return <HomePageClient user={user} articles={articles} />;
}
