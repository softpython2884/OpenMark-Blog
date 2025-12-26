import { getUserProfileData } from '@/lib/data';
import { getUser } from '@/lib/auth';
import { notFound } from 'next/navigation';
import { ProfileClientPage } from '@/components/profile-client-page';

export default async function ProfilePage({ params }: { params: { id: string } }) {
    const loggedInUser = await getUser();
    const userId = parseInt(params.id, 10);

    if (isNaN(userId)) {
        notFound();
    }
    
    const profileData = await getUserProfileData(userId);

    if (!profileData) {
        notFound();
    }
    
    const { user, articles } = profileData;

    return <ProfileClientPage user={user} articles={articles} loggedInUser={loggedInUser} />;
}
