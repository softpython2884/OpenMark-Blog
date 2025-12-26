export type Role = 'ADMIN' | 'EDITOR' | 'AUTHOR' | 'MODERATOR' | 'READER';

export type BadgeInfo = {
    name: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
};

export type User = {
  id: number;
  name: string;
  email: string;
  role: Role;
  avatarUrl: string;
  registrationDate: string;
  bio?: string | null;
  isEmailPublic?: boolean;
  score?: number;
  level?: number;
  levelProgress?: number;
  badges?: BadgeInfo[];
};

export type Tag = {
  id: number;
  name: string;
};

export type Article = {
  id: number;
  title: string;
  slug: string;
  content: string;
  summary: string | null;
  imageUrl: string | null;
  authorId: number;
  authorName?: string;
  authorAvatarUrl?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  tags: Tag[];
  likes: number;
  isLiked?: boolean;
};

export type Comment = {
  id: number;
  content: string;
  articleId: number;
  authorId: number;
  authorName?: string;
  authorAvatarUrl?: string;
  createdAt: string;
};
