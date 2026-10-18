export interface AuthorProfile {
  name: string;
  role: string;
  avatar: string;
  location: string;
  shortBio: string;
  heading: string;
  paragraphs: string[];
  socials: {
    email: string;
    github?: string;
    linkedin?: string;
    twitter?: string;
    website?: string;
    instagram?: string;
    youtube?: string;
  };
  milestones: {
    year: string;
    title: string;
    desc: string;
  }[];
  skills: {
    category: string;
    skills: string[];
  }[];
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  category: string;
  coverImage: string;
  publishedDate: string;
  readingTime: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  featured?: boolean;
  publishedStatus?: 'published' | 'draft';
  tags: string[];
  likes: number;
  content: {
    intro: string;
    sections: {
      heading: string;
      text: string;
      code?: {
        language: string;
        filename?: string;
        snippet: string;
      };
      callout?: string;
      bulletPoints?: string[];
    }[];
    conclusion: string;
  };
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  articleCount?: number;
  iconName?: string;
  createdAt?: string;
  updatedAt?: string;
  authorEmail?: string;
}

export interface CommentItem {
  id: string;
  articleId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  read: boolean;
}

