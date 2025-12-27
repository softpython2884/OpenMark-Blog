import { getUserProfileData, getUserByName } from '@/lib/data';
import { getUser } from '@/lib/auth';
import { notFound } from 'next/navigation';
import { ProfileClientPage } from '@/components/profile-client-page';
import { Metadata, ResolvingMetadata } from 'next';

type Props = {
    params: { name: string }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const userName = decodeURIComponent(params.name);
  const user = await getUserByName(userName);
 
  if (!user) {
    return {
        title: 'User Not Found'
    }
  }

  const previousImages = (await parent).openGraph?.images || []

  return {
    title: user.name,
    description: user.bio || `Check out the profile of ${user.name} on OpenMark Blog.`,
    openGraph: {
        title: user.name,
        description: user.bio || `Check out the profile of ${user.name} on OpenMark Blog.`,
        images: [user.avatarUrl, ...previousImages],
    },
    twitter: {
      card: 'summary_large_image',
      title: user.name,
      description: user.bio || `Check out the profile of ${user.name} on OpenMark Blog.`,
      images: [user.avatarUrl],
    },
  }
}

export default async function ProfilePage({ params }: { params: { name: string } }) {
    const loggedInUser = await getUser();
    
    // Decode the user name from the URL
    const userName = decodeURIComponent(params.name);

    if (!userName) {
        notFound();
    }
    
    const profileData = await getUserProfileData(userName, loggedInUser?.id);

    if (!profileData) {
        notFound();
    }
    
    const { user, articles, topArticles } = profileData;

    return <ProfileClientPage user={user} articles={articles} topArticles={topArticles} loggedInUser={loggedInUser} />;
}
