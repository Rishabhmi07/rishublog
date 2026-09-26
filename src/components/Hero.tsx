import React from 'react';
import { ArrowRight, User, Sparkles } from 'lucide-react';
import { CodePlayground } from './CodePlayground';

interface HeroProps {
  onExploreArticles: () => void;
  onAboutMe: () => void;
  articleCount?: number;
}

export const Hero: React.FC<HeroProps> = ({ onExploreArticles, onAboutMe, articleCount = 0 }) => {
  return (
    <section className="relative overflow-hidden py-12 md:py-20 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-linear-to-b from-indigo-50/30 via-transparent to-transparent dark:from-indigo-950/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Hero Content */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 text-xs font-medium text-indigo-700 dark:text-indigo-400">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>3rd-Year B.Tech CSE (AI/ML) · Technical Notes & Builds</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-white font-heading leading-tight" style={{ textWrap: 'balance' }}>
              Learn. Build.{' '}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-600 via-purple-600 to-indigo-500 dark:from-indigo-400 dark:via-purple-400 dark:to-indigo-300">
                Share.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-300 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Documenting my journey through programming, AI/ML, web development, and technology.
              Deep dives into neural architectures, C memory pointers, systems code, and semester projects.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={onExploreArticles}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
              >
                <span>Explore Articles</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onAboutMe}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-zinc-800 dark:text-zinc-200 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl transition-all cursor-pointer"
              >
                <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>About Me</span>
              </button>
            </div>

            {/* Quick Proof Metrics */}
            <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800/80 flex items-center justify-center lg:justify-start gap-8 text-xs text-zinc-500 dark:text-zinc-400">
              <div>
                <span className="block font-bold text-zinc-900 dark:text-white text-base font-mono tabular-nums">
                  {articleCount}
                </span>
                <span>{articleCount === 1 ? 'Article' : 'Articles'}</span>
              </div>
              <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800" />
              <div>
                <span className="block font-bold text-zinc-900 dark:text-white text-base font-mono tabular-nums">
                  6
                </span>
                <span>Core Topics</span>
              </div>
              <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800" />
              <div>
                <span className="block font-bold text-zinc-900 dark:text-white text-base font-mono tabular-nums">
                  100%
                </span>
                <span>Hands-on Code</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Code Sandbox */}
          <div className="lg:col-span-6 w-full">
            <CodePlayground />
          </div>
        </div>
      </div>
    </section>
  );
};
