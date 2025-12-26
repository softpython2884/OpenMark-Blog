import { getUserProfileData } from '@/lib/data';
import { getUser } from '@/lib/auth';
import { notFound } from 'next/navigation';
import { ProfileClientPage } from '@/components/profile-client-page';

export default async function ProfilePage({ params }: { params: { name: string } }) {
    const loggedInUser = await getUser();
    
    // Decode the user name from the URL
    const userName = decodeURIComponent(params.name);

    if (!userName) {
        notFound();
    }
    
    const profileData = await getUserProfileData(userName);

    if (!profileData) {
        notFound();
    }
    
    const { user, articles, topArticles } = profileData;

    return <ProfileClientPage user={user} articles={articles} topArticles={topArticles} loggedInUser={loggedInUser} />;
}
