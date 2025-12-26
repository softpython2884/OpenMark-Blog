import { getUser } from "@/lib/auth";
import { getUserProfileData } from "@/lib/data";
import { notFound, redirect } from "next/navigation";
import { EditProfileForm } from "./edit-profile-form";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: 'Edit Profile',
};

export default async function EditProfilePage() {
    const user = await getUser();
    if(!user) {
        redirect('/login');
    }

    const profileData = await getUserProfileData(user.name);

    if (!profileData) {
        notFound();
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <h1 className="text-4xl font-headline font-bold mb-8">Edit Profile</h1>
            <EditProfileForm user={profileData.user} />
        </div>
    )
}
