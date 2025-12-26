import { getUser } from "@/lib/auth";
import { getArticlesByAuthorId } from "@/lib/data";
import { redirect } from "next/navigation";
import { MyArticlesClient } from "@/components/my-articles-client";

export default async function MyArticlesPage() {
    const user = await getUser();

    if (!user || !['ADMIN', 'EDITOR', 'AUTHOR'].includes(user.role)) {
        redirect('/login');
    }

    const articles = await getArticlesByAuthorId(user.id);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-headline font-bold mb-8">My Articles</h1>
            <MyArticlesClient articles={articles} />
        </div>
    );
}
