# OpenMark Blog Platform

Welcome to OpenMark, a modern, open-source blogging platform built with a powerful and scalable technology stack. This platform provides a rich-media editing experience, robust user management, and AI-powered features to enhance content creation.

## ✨ Features

- **Article Management**: Create, edit, and publish articles using a user-friendly editor that supports HTML, Markdown import, and custom components.
- **User Authentication**: Secure signup and login system with role-based access control.
- **Dynamic User Roles**:
    - **ADMIN**: Full control over the platform, including user management and site settings.
    - **EDITOR**: Can publish and manage any article.
    - **AUTHOR**: Can create and manage their own articles.
    - **MODERATOR**: Can manage user-submitted reports and suspend users.
    - **READER**: Default role for registered users.
    - **SUSPENDED**: A restricted state where users cannot post comments.
- **Interactive Social Features**:
    - **Follow System**: Users can follow their favorite authors.
    - **Threaded Comments**: Engage in discussions with nested replies.
    - **Likes**: Show appreciation for articles.
- **Personalization**:
    - **"For You" Feed**: The homepage features a personalized feed with the latest articles from followed authors.
    - **AI Recommendations**: A dedicated section recommends articles based on the user's reading history (tag-based).
- **Gamification & Engagement**:
    - **XP and Leveling System**: Authors gain XP for publishing, receiving likes, comments, and followers.
    - **User Badges**: Earn badges for milestones (e.g., "New Leaf", "Scribe").
- **Admin & Moderation Panel**:
    - Manage user roles and permissions.
    - **Featured Article**: Hand-pick an article to feature in the homepage hero section.
    - **Reporting System**: Review and act on user-submitted reports for articles and comments.
- **Rich Content & Sharing**:
    - **Embeds**: Easily embed content from external sources like YouTube.
    - **Article Embedding**: Allow your own articles to be embedded on other websites via an `<iframe>`.
    - **Social Sharing**: Quick-share buttons for X (Twitter), LinkedIn, and copying links.
- **AI-Powered Content Tools**:
    - Generate article summaries (TL;DR).
    - Get SEO-optimized title suggestions.
    - Receive relevant tag suggestions to improve discoverability.

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [npm](https://www.npmjs.com/) (or yarn/pnpm)

### Installation & Local Setup

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/your-repo-name.git
    cd your-repo-name
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Set up environment variables**:
    Create a `.env` file in the root of the project. This file is crucial for securing your application.
    ```env
    # Generate a long, random, secret string for signing JWTs.
    # You can use an online generator or a command like:
    # openssl rand -base64 32
    JWT_SECRET=your-super-secret-key
    ```
    > **Important**: The default JWT secret is insecure and for development only. **You must change this** for production.

4.  **Run the development server**:
    The application uses a local SQLite database (`local.db`) which is created and seeded automatically on the first run.
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:9002`.

## 🧑‍💻 Default User Accounts

The database is seeded with three default users to facilitate testing and development:

-   **Admin**:
    -   **Email**: `admin@example.com`
    -   **Password**: `admin`
-   **Author**:
    -   **Email**: `author@example.com`
    -   **Password**: `author`
-   **Reader**:
    -   **Email**: `reader@example.com`
    -   **Password**: `reader`

## ⚙️ Configuration & Customization

### Theming
The application uses **ShadCN UI** and **Tailwind CSS**. You can customize the theme by editing the CSS variables in `src/app/globals.css`. Modify the HSL values for `--primary`, `--background`, `--accent`, etc., to change the color scheme.

### AI Configuration (Genkit)
The AI features are powered by Google's Genkit. The configuration is located in `src/ai/genkit.ts`. To use your own Google AI models, you'll need to set up a Google Cloud project and an API key.

1.  Create a project on [Google AI Studio](https://aistudio.google.com/).
2.  Get your API key.
3.  Add the API key to your `.env` file:
    ```env
    GEMINI_API_KEY=your-google-ai-api-key
    ```
4.  The Genkit configuration in `src/ai/genkit.ts` will automatically pick up this key.

### Placeholder Images
Placeholder images are managed in `src/lib/placeholder-images.json`. You can replace these with your own high-quality default images from services like Unsplash.

## ☁️ Deployment

This Next.js application is configured for easy deployment on platforms that support Node.js, such as Vercel, Netlify, or Firebase App Hosting.

### Key Considerations:

1.  **Environment Variables**: Ensure you set the `JWT_SECRET` and `GEMINI_API_KEY` environment variables in your hosting provider's dashboard.
2.  **Database**: This project uses SQLite for local development. For production, you will need to switch to a managed database service like Vercel Postgres, Supabase, or Firebase Firestore and update the database connection logic in `src/lib/db.ts` and `src/lib/data.ts`.
3.  **Build Command**: The standard build command is `npm run build`.
4.  **Start Command**: The start command is `npm start`.
5.  **Firebase App Hosting**: An `apphosting.yaml` file is included, configured for deployment on Firebase App Hosting.

---

Built with ❤️ in Firebase Studio.
