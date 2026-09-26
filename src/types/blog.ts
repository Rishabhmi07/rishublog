export interface Article {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  category: 'AI & Machine Learning' | 'Web Development' | 'Programming' | 'Java' | 'Python' | 'Projects';
  coverImage: string;
  publishedDate: string;
  readingTime: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  featured?: boolean;
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
  articleCount: number;
  iconName: string;
}

export interface CommentItem {
  id: string;
  articleId: string;
  authorName: string;
  content: string;
  createdAt: string;
}
