import { Article, CategoryItem } from '../types/blog';

export const AUTHOR_RISHU = {
  name: 'Rishu Mishra',
  role: '3rd-Year B.Tech CSE (AI/ML) Student',
  avatar: '/src/assets/images/avatar_rishu_1790415025306.jpg',
};

export const INITIAL_CATEGORIES: CategoryItem[] = [
  {
    id: 'ai-ml',
    name: 'AI & Machine Learning',
    slug: 'ai-ml',
    description: 'Neural networks, PyTorch fundamentals, computer vision, and modern predictive models.',
    articleCount: 0,
    iconName: 'Cpu',
  },
  {
    id: 'web-dev',
    name: 'Web Development',
    slug: 'web-dev',
    description: 'Modern JavaScript runtime, React patterns, full-stack architectures, and performance optimization.',
    articleCount: 0,
    iconName: 'Globe',
  },
  {
    id: 'programming',
    name: 'Programming',
    slug: 'programming',
    description: 'Core computer science fundamentals, memory management, pointers, and data structures in C.',
    articleCount: 0,
    iconName: 'Terminal',
  },
  {
    id: 'java',
    name: 'Java',
    slug: 'java',
    description: 'Object-oriented programming, packages, access specifiers, and JVM architecture essentials.',
    articleCount: 0,
    iconName: 'Layers',
  },
  {
    id: 'python',
    name: 'Python',
    slug: 'python',
    description: 'NumPy vectorization, Pandas data wrangling, tensor mathematics, and ML scripting.',
    articleCount: 0,
    iconName: 'Code',
  },
  {
    id: 'projects',
    name: 'Projects',
    slug: 'projects',
    description: 'End-to-end applications, real-world case studies, and hands-on B.Tech semester builds.',
    articleCount: 0,
    iconName: 'FolderGit2',
  },
];

// Preset cover images that the author can pick from
export const PRESET_COVER_IMAGES = [
  {
    name: 'AI & Neural Strand',
    url: '/src/assets/images/hero_featured_ai_1790414959167.jpg',
  },
  {
    name: 'AI & ML Roadmap',
    url: '/src/assets/images/article_ai_roadmap_1790414973676.jpg',
  },
  {
    name: 'JavaScript & Web Dev',
    url: '/src/assets/images/article_js_concepts_1790414986404.jpg',
  },
  {
    name: 'C Pointers & Systems',
    url: '/src/assets/images/article_c_pointers_1790414998359.jpg',
  },
  {
    name: 'Python & Data Matrices',
    url: '/src/assets/images/article_python_ml_1790415010492.jpg',
  },
];

// All default articles deleted as requested by the user
export const INITIAL_ARTICLES: Article[] = [];
