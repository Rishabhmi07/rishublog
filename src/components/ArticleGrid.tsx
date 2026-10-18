import React, { useState } from 'react';
import { Search, PenSquare, Filter, BookOpen } from 'lucide-react';
import { Article, CategoryItem } from '../types/blog';
import { ArticleCard } from './ArticleCard';

interface ArticleGridProps {
  articles: Article[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  onReadArticle: (article: Article) => void;
  onLikeArticle: (id: string, e: React.MouseEvent) => void;
  bookmarks: string[];
  onToggleBookmark: (id: string, e: React.MouseEvent) => void;
  onDeleteArticle?: (id: string, e: React.MouseEvent) => void;
  onEditArticle?: (article: Article) => void;
  onOpenNewArticle?: () => void;
  isAdminLoggedIn?: boolean;
  isLoading?: boolean;
  categories?: CategoryItem[];
  authorAvatar?: string;
}

export const ArticleGrid: React.FC<ArticleGridProps> = ({
  articles,
  selectedCategory,
  onSelectCategory,
  onReadArticle,
  onLikeArticle,
  bookmarks,
  onToggleBookmark,
  onDeleteArticle,
  onEditArticle,
  onOpenNewArticle,
  isAdminLoggedIn = false,
  isLoading = false,
  categories = [],
  authorAvatar,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'popular'>('newest');

  const categoryList = [
    'All',
    ...(categories.length > 0
      ? categories.map((c) => c.name)
      : ['AI & Machine Learning', 'Web Development', 'Programming', 'Java', 'Python', 'Projects']),
  ];

  // Filter and sort articles
  const filteredArticles = articles
    .filter((art) => {
      const matchCategory =
        selectedCategory === 'All' || art.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchSearch =
        art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCategory && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'popular') {
        return b.likes - a.likes;
      }
      return new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime();
    });

  return (
    <section id="articles-section" className="py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-semibold tracking-wider uppercase text-indigo-600 dark:text-indigo-400">
              Articles & Guides
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white font-heading">
              Published Articles ({articles.length})
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Technical notes, deep dives into source code, and project reflections.
            </p>
          </div>

          {/* Quick Search & Sort within Section */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Filter by keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-56 pl-9 pr-3 py-1.5 text-xs bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center p-1 bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
              <button
                onClick={() => setSortBy('newest')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  sortBy === 'newest'
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                Newest
              </button>
              <button
                onClick={() => setSortBy('popular')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  sortBy === 'popular'
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                Popular
              </button>
            </div>
          </div>
        </div>

        {/* Interactive Filter Tabs (functional segmented buttons) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {categoryList.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors border cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Loading Skeleton */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-4 space-y-4 animate-pulse shadow-xs"
              >
                <div className="aspect-4/3 w-full bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
                <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded-md w-1/3" />
                <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded-md w-3/4" />
                <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded-md w-full" />
              </div>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-20 px-4 rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 shadow-xs">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <BookOpen className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white font-heading">
              No articles published yet
            </h3>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto mt-2 leading-relaxed">
              {isAdminLoggedIn
                ? 'Default articles have been cleared. You have a clean slate! Click below to publish your first tech article with code snippets and custom cover images.'
                : 'Rishu is currently compiling technical deep dives, project logs, and tutorials. Check back soon for new publications!'}
            </p>
            {isAdminLoggedIn && onOpenNewArticle && (
              <button
                onClick={onOpenNewArticle}
                className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
              >
                <PenSquare className="w-4 h-4" />
                <span>Write Your First Article</span>
              </button>
            )}
          </div>
        ) : filteredArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {filteredArticles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                onReadArticle={onReadArticle}
                onLikeArticle={onLikeArticle}
                isBookmarked={bookmarks.includes(article.id)}
                onToggleBookmark={onToggleBookmark}
                onDeleteArticle={isAdminLoggedIn ? onDeleteArticle : undefined}
                onEditArticle={isAdminLoggedIn && onEditArticle ? (art, e) => { e.stopPropagation(); onEditArticle(art); } : undefined}
                authorAvatar={authorAvatar}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-4 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
            <Filter className="w-8 h-8 text-zinc-400 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
              No matching articles found
            </h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1">
              No posts matched your filter "{searchQuery}". Try selecting another category or clear your search query.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                onSelectCategory('All');
              }}
              className="mt-4 px-4 py-2 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
