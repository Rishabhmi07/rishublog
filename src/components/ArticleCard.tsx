import React from 'react';
import { ArrowUpRight, Clock, Calendar, Heart, Bookmark, Trash2, Pencil } from 'lucide-react';
import { Article } from '../types/blog';

interface ArticleCardProps {
  article: Article;
  onReadArticle: (article: Article) => void;
  onLikeArticle: (id: string, e: React.MouseEvent) => void;
  isBookmarked: boolean;
  onToggleBookmark: (id: string, e: React.MouseEvent) => void;
  onDeleteArticle?: (id: string, e: React.MouseEvent) => void;
  onEditArticle?: (article: Article, e: React.MouseEvent) => void;
  authorAvatar?: string;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  onReadArticle,
  onLikeArticle,
  isBookmarked,
  onToggleBookmark,
  onDeleteArticle,
  onEditArticle,
  authorAvatar,
}) => {
  const displayAvatar = authorAvatar || article.author?.avatar;
  return (
    <article
      onClick={() => onReadArticle(article)}
      className="group flex flex-col justify-between rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 shadow-xs hover:shadow-lg hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300 cursor-pointer"
    >
      <div>
        {/* Cover Image Container */}
        <div className="relative aspect-4/3 w-full overflow-hidden bg-zinc-950">
          <img
            src={article.coverImage}
            alt={article.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          />
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

          {/* Quick Action Buttons (Edit & Delete only rendered if Admin is authenticated) */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5">
            {onEditArticle && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditArticle(article, e);
                }}
                title="Edit article"
                className="p-2 rounded-lg bg-black/60 hover:bg-indigo-600/90 backdrop-blur-xs text-white transition-all active:scale-90 shadow-sm"
              >
                <Pencil className="w-3.5 h-3.5 text-white" />
              </button>
            )}

            {onDeleteArticle && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm('Are you sure you want to delete this article?')) {
                    onDeleteArticle(article.id, e);
                  }
                }}
                title="Delete article"
                className="p-2 rounded-lg bg-black/60 hover:bg-rose-600/90 backdrop-blur-xs text-white transition-all active:scale-90 shadow-sm"
              >
                <Trash2 className="w-3.5 h-3.5 text-white" />
              </button>
            )}

            <button
              onClick={(e) => onToggleBookmark(article.id, e)}
              title={isBookmarked ? 'Remove bookmark' : 'Bookmark article'}
              className="p-2 rounded-lg bg-black/50 hover:bg-black/80 backdrop-blur-xs text-white transition-all active:scale-90"
            >
              <Bookmark
                className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-indigo-400 text-indigo-400' : 'text-white'}`}
              />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-3">
          {/* Category & Date Metadata */}
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">
              {article.category}
            </span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-zinc-400" />
              {article.publishedDate}
            </span>
          </div>

          <h3 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors font-heading line-clamp-2">
            {article.title}
          </h3>

          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-3">
            {article.shortDescription}
          </p>
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-5 sm:px-6 pb-5 pt-3 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
        <div className="flex items-center gap-2.5">
          {displayAvatar && (
            <img
              src={displayAvatar}
              alt={article.author?.name || 'Author'}
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
              className="w-5 h-5 rounded-full object-cover border border-zinc-200 dark:border-zinc-700 shrink-0"
            />
          )}
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-zinc-400" />
            {article.readingTime || '5 min read'}
          </span>
          <span aria-hidden="true">·</span>
          <button
            onClick={(e) => onLikeArticle(article.id, e)}
            className="flex items-center gap-1 hover:text-rose-500 transition-colors"
          >
            <Heart className="w-3.5 h-3.5" />
            <span className="font-mono tabular-nums">{article.likes}</span>
          </button>
        </div>

        <span className="inline-flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform">
          <span>Read</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </article>
  );
};
