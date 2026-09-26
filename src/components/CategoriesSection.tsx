import React from 'react';
import { Cpu, Globe, Terminal, Layers, Code, FolderGit2, ArrowRight } from 'lucide-react';
import { CategoryItem } from '../types/blog';

interface CategoriesSectionProps {
  categories: CategoryItem[];
  onSelectCategory: (categoryName: string) => void;
}

export const CategoriesSection: React.FC<CategoriesSectionProps> = ({
  categories,
  onSelectCategory,
}) => {
  const getIcon = (name: string) => {
    switch (name) {
      case 'Cpu':
        return <Cpu className="w-6 h-6 text-indigo-500" />;
      case 'Globe':
        return <Globe className="w-6 h-6 text-cyan-500" />;
      case 'Terminal':
        return <Terminal className="w-6 h-6 text-amber-500" />;
      case 'Layers':
        return <Layers className="w-6 h-6 text-rose-500" />;
      case 'Code':
        return <Code className="w-6 h-6 text-emerald-500" />;
      case 'FolderGit2':
        return <FolderGit2 className="w-6 h-6 text-purple-500" />;
      default:
        return <Code className="w-6 h-6 text-indigo-500" />;
    }
  };

  return (
    <section id="categories-section" className="py-12 md:py-16 border-t border-zinc-200/80 dark:border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-semibold tracking-wider uppercase text-indigo-600 dark:text-indigo-400">
              Taxonomy
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white font-heading">
              Browse by Category
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Explore organized subject tracks spanning neural models, system kernels, and web architectures.
            </p>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.name)}
              className="group p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 hover:border-indigo-500/40 hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 group-hover:scale-110 transition-transform">
                    {getIcon(cat.iconName)}
                  </div>
                  <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
                    {cat.articleCount} {cat.articleCount === 1 ? 'article' : 'articles'}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-zinc-900 dark:text-white font-heading group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {cat.name}
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  {cat.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs font-medium text-indigo-600 dark:text-indigo-400">
                <span>Explore category</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
