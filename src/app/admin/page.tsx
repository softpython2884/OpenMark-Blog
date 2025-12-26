import { getUser } from "@/lib/auth";
import { getAllUsers } from "@/lib/data";
import { redirect } from "next/navigation";
import { UserRoleManager } from "@/components/user-role-manager";

export default async function AdminPage() {
    const user = await getUser();

    if (!user || !['ADMIN', 'MODERATOR'].includes(user.role)) {
        redirect('/');
    }

    const users = await getAllUsers();

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-headline font-bold mb-8">Admin Panel</h1>

            <div className="space-y-12">
                <section>
                    <h2 className="text-2xl font-semibold mb-4">User Management</h2>
                    <UserRoleManager users={users} currentUser={user} />
                </section>
                
                {/* Other admin sections can be added here */}
            </div>
        </div>
    );
}
