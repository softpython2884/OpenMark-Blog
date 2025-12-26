# **App Name**: OpenMark Blog

## Core Features:

- Markdown Article Creation: Create, edit, and publish articles using a rich markdown editor with live preview, emoji picker with custom emojis, and custom icon support.
- Role-Based Access Control: Implement a role-based access control system that supports reader, author, editor, moderator, and admin roles with permissions enforced at API and UI levels.
- Social Interaction: Users can interact with articles through likes, dislikes, comments, and sharing to social platforms.
- Article Summarization: Automatically generate a concise summary (TL;DR) for each article using AI. This summary should appear above the article content.
- AI-Powered Title Generation: Suggest optimized blog titles using AI based on the article’s content to generate stronger, more engaging titles and improve SEO. It uses the content of the article as a tool when forming its response.
- AI-Assisted Article Tagging: Suggest relevant tags for each article using AI to improve SEO visibility and content discoverability.
- SQLite Database (Better-SQLite3): Use Better-SQLite3 to manage the internal database for articles, comments, user profiles, likes, and tags.
- Admin Panel: Admin page (/admin/) to manage user roles and customize the blog.

## Style Guidelines:

- Primary color: Soft blue (#A0D2EB) to evoke a sense of calmness and trust, aligning with the simplicity of Google's style.
- Background color: Very light gray (#F5F5F5), nearly white, providing a clean and distraction-free backdrop for content.
- Accent color: Light blue (#B0E2FF), slightly more saturated than the primary, used for interactive elements and highlights.
- Headline font: 'PT Sans', sans-serif, matching to body if desired
- Body font: 'PT Sans', sans-serif
- Simple, clean icons in line with Google's Material Design to represent categories and actions.
- A clean, minimal layout with a focus on readability and content hierarchy, using a desktop-first responsive approach.