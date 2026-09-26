import React from 'react';
import { ArrowUpRight, Clock, Calendar, Heart, Bookmark, Trash2 } from 'lucide-react';
import { Article } from '../types/blog';

interface ArticleCardProps {
  article: Article;
  onReadArticle: (article: Article) => void;
  onLikeArticle: (id: string, e: React.MouseEvent) => void;
  isBookmarked: boolean;
  onToggleBookmark: (id: string, e: React.MouseEvent) => void;
  onDeleteArticle?: (id: string, e: React.MouseEvent) => void;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  onReadArticle,
  onLikeArticle,
  isBookmarked,
  onToggleBookmark,
  onDeleteArticle,
}) => {
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

          {/* Quick Action Buttons */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5">
            {onDeleteArticle && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm('Are you sure you want to delete this article?')) {
                    onDeleteArticle(article.id, e);
                  }
                }}
                title="Delete article"
                className="p-2 rounded-lg bg-black/50 hover:bg-rose-600/90 backdrop-blur-xs text-white transition-all active:scale-90"
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
          {/* Category & Date Metadata (Zero-pill discipline: quiet unboxed text) */}
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">
              {article.category}
            </span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-zinc-400" />
              {article.publishedDate}
            </span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-zinc-400" />
              {article.readingTime}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white font-heading group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 leading-snug">
            {article.title}
          </h3>

          {/* Short description */}
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 line-clamp-2 leading-relaxed">
            {article.shortDescription}
          </p>
        </div>
      </div>

      {/* Card Footer: Author + Read More */}
      <div className="px-5 sm:px-6 pb-5 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img
            src={article.author.avatar}
            alt={article.author.name}
            referrerPolicy="no-referrer"
            className="w-6 h-6 rounded-full object-cover border border-zinc-200 dark:border-zinc-700"
          />
          <span className="text-xs text-zinc-600 dark:text-zinc-400">
            {article.author.name.split(' ')[0]}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={(e) => onLikeArticle(article.id, e)}
            className="flex items-center gap-1 text-xs text-zinc-400 hover:text-rose-500 transition-colors p-1"
            title="Like article"
          >
            <Heart className="w-3.5 h-3.5" />
            <span className="font-mono tabular-nums text-xs">{article.likes}</span>
          </button>

          <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform">
            Read More
            <ArrowUpRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </article>
  );
};
