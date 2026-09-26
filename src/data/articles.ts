import { Article, CategoryItem, AuthorProfile } from '../types/blog';

export const DEFAULT_AUTHOR_PROFILE: AuthorProfile = {
  name: 'Rishu Mishra',
  role: '3rd-Year B.Tech CSE (AI/ML) Student',
  avatar: '/src/assets/images/avatar_rishu_1790415025306.jpg',
  location: 'India · B.Tech CSE (AI/ML)',
  shortBio: 'Passionate software developer and undergraduate researcher exploring the intersection of deep learning algorithms and production software systems.',
  heading: 'Engineering with Curiosity & First Principles',
  paragraphs: [
    "Hey there! I'm Rishu Mishra, currently in my 3rd year pursuing a Bachelor of Technology in Computer Science and Engineering with a specialization in Artificial Intelligence and Machine Learning.",
    "My philosophy around software engineering is simple: to truly understand something, you must build it from scratch. Whether that means allocating heap memory byte-by-byte in C, writing a matrix backpropagation routine in NumPy, or architecting a reactive single-page application in React, I believe in demystifying the black box.",
    "This blog serves as my digital workshop—a place where I publish detailed notes, semester build logs, algorithmic breakdowns, and tutorials to help fellow students and developers navigate the rapidly evolving world of tech."
  ],
  socials: {
    email: 'mishra939rishu@gmail.com',
    github: 'https://github.com',
    linkedin: 'https://linkedin.com',
    twitter: '',
    website: '',
    instagram: '',
    youtube: '',
  },
  milestones: [
    {
      year: 'Year 3 (Current)',
      title: 'AI/ML Specialization & Cloud Architecture',
      desc: 'Diving deep into PyTorch transformer models, computer vision pipelines, LLM fine-tuning, and scalable microservices on Docker & Cloud Run.',
    },
    {
      year: 'Year 2',
      title: 'Data Structures, Java OOP & Web Engineering',
      desc: 'Mastered memory graphs, algorithmic complexity, Java package structures, relational databases, and modern full-stack web development.',
    },
    {
      year: 'Year 1',
      title: 'Foundations of Computer Science & C',
      desc: 'Built low-level systems intuition through C memory pointers, CPU architecture, discrete mathematics, and boolean logic.',
    },
  ],
  skills: [
    {
      category: 'Languages',
      skills: ['Python', 'C / C++', 'Java', 'TypeScript', 'SQL', 'Bash'],
    },
    {
      category: 'AI & Data Science',
      skills: ['PyTorch', 'Scikit-Learn', 'NumPy', 'Pandas', 'Transformers', 'OpenCV'],
    },
    {
      category: 'Web & Infrastructure',
      skills: ['React', 'Node.js', 'Express', 'Tailwind CSS', 'Docker', 'Git & GitHub'],
    },
  ],
};

export const AUTHOR_RISHU = {
  name: DEFAULT_AUTHOR_PROFILE.name,
  role: DEFAULT_AUTHOR_PROFILE.role,
  avatar: DEFAULT_AUTHOR_PROFILE.avatar,
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
