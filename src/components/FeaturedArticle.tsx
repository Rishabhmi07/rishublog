import React from 'react';
import { ArrowUpRight, Clock, Calendar, Heart } from 'lucide-react';
import { Article } from '../types/blog';

interface FeaturedArticleProps {
  article: Article;
  onReadArticle: (article: Article) => void;
  onLikeArticle: (id: string, e: React.MouseEvent) => void;
  authorAvatar?: string;
}

export const FeaturedArticle: React.FC<FeaturedArticleProps> = ({
  article,
  onReadArticle,
  onLikeArticle,
  authorAvatar,
}) => {
  const displayAvatar = authorAvatar || article.author?.avatar;
  return (
    <section className="py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-xs font-semibold tracking-wider uppercase text-indigo-600 dark:text-indigo-400">
              Spotlight
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white font-heading">
              Featured Article
            </h2>
          </div>
        </div>

        {/* Featured Card */}
        <div
          onClick={() => onReadArticle(article)}
          className="group relative rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-xl hover:border-indigo-500/30 transition-all duration-300 cursor-pointer"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            {/* Image Column */}
            <div className="lg:col-span-7 relative h-72 sm:h-96 lg:h-auto overflow-hidden bg-zinc-950">
              <img
                src={article.coverImage}
                alt={article.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent lg:hidden" />
            </div>

            {/* Content Column */}
            <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
              <div className="space-y-4">
                {/* Category & Metadata (Zero-pill discipline: unboxed text with separators) */}
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
                <h3 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white font-heading group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight">
                  {article.title}
                </h3>

                {/* Excerpt */}
                <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 leading-relaxed line-clamp-3">
                  {article.shortDescription}
                </p>

                {/* Tags (subtle quiet inline text) */}
                <div className="flex flex-wrap items-center gap-2 pt-2 text-xs text-zinc-500 dark:text-zinc-400">
                  {article.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="hover:text-indigo-500 transition-colors">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Row: Author + CTA */}
              <div className="pt-8 mt-6 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={displayAvatar}
                    alt={article.author.name}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLElement).style.opacity = '0.5';
                    }}
                    className="w-10 h-10 rounded-full object-cover border border-zinc-200 dark:border-zinc-700"
                  />
                  <div>
                    <span className="block text-xs font-semibold text-zinc-900 dark:text-white">
                      {article.author.name}
                    </span>
                    <span className="block text-[11px] text-zinc-500 dark:text-zinc-400">
                      {article.author.role}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => onLikeArticle(article.id, e)}
                    className="flex items-center gap-1 text-xs text-zinc-500 hover:text-rose-500 transition-colors p-2"
                    title="Like article"
                  >
                    <Heart className="w-4 h-4" />
                    <span className="font-mono tabular-nums">{article.likes}</span>
                  </button>

                  <button
                    onClick={() => onReadArticle(article)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 group-hover:bg-indigo-700 rounded-lg shadow-sm transition-all"
                  >
                    <span>Read Article</span>
                    <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
