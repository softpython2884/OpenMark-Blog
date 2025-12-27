
export type Role = 'ADMIN' | 'EDITOR' | 'AUTHOR' | 'MODERATOR' | 'READER' | 'SUSPENDED';

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
  followerCount?: number;
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
  isFeatured?: boolean;
  visibility: 'public' | 'private';
};

export type Comment = {
  id: number;
  content: string;
  articleId: number;
  authorId: number;
  authorName?: string;
  authorAvatarUrl?: string;
  createdAt: string;
  parentId: number | null;
  children?: Comment[];
};

export type Report = {
  id: number;
  type: 'article' | 'comment';
  itemId: number;
  reporterId: number;
  reporterName: string;
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
  itemContent: string; // This will hold article title or comment content
  itemUrl: string;
};
