
import { getUser } from "@/lib/auth";
import { getAllUsers, getAllPublishedArticlesWithAuthor, getPendingReports } from "@/lib/data";
import { redirect } from "next/navigation";
import { UserRoleManager } from "@/components/user-role-manager";
import { FeaturedArticleManager } from "@/components/featured-article-manager";
import { ReportManager } from "@/components/report-manager";
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Admin Panel',
};

export default async function AdminPage() {
    const user = await getUser();

    if (!user || !['ADMIN', 'MODERATOR'].includes(user.role)) {
        redirect('/');
    }

    const users = await getAllUsers();
    const articles = await getAllPublishedArticlesWithAuthor();
    const reports = await getPendingReports();

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-headline font-bold mb-8">Admin Panel</h1>

            <div className="space-y-12">
                 <section>
                    <h2 className="text-2xl font-semibold mb-4">Signalements en attente</h2>
                    <ReportManager reports={reports} />
                </section>
                
                <section>
                    <h2 className="text-2xl font-semibold mb-4">User Management</h2>
                    <UserRoleManager users={users} currentUser={user} />
                </section>
                
                {user.role === 'ADMIN' && (
                    <section>
                        <h2 className="text-2xl font-semibold mb-4">Featured Article</h2>
                        <p className="text-muted-foreground mb-4">Select an article to feature in the hero section of the homepage.</p>
                        <FeaturedArticleManager articles={articles} />
                    </section>
                )}
            </div>
        </div>
    );
}
