
import { getPublishedArticles, getFollowedArticles, getRecommendedArticles } from '@/lib/data';
import { getUser } from '@/lib/auth';
import { HomePageClient } from '@/components/home-page-client';

export default async function Home() {
  const user = await getUser();
  const articles = await getPublishedArticles();
  const followedArticles = user ? await getFollowedArticles(user.id) : [];
  const recommendedArticles = user ? await getRecommendedArticles(user.id) : [];

  return <HomePageClient user={user} articles={articles} followedArticles={followedArticles} recommendedArticles={recommendedArticles} />;
}
