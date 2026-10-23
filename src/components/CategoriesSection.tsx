import React from 'react';
import {
  Cpu,
  Globe,
  Terminal,
  Layers,
  Code,
  FolderGit2,
  ArrowRight,
  Plus,
  Pencil,
  Tags,
  ShieldCheck,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { CategoryItem } from '../types/blog';

interface CategoriesSectionProps {
  categories: CategoryItem[];
  onSelectCategory: (categoryName: string) => void;
  isAdminLoggedIn?: boolean;
  onOpenAdminCategories?: () => void;
  onAddCategory?: () => void;
  onEditCategory?: (category: CategoryItem) => void;
}

export const CategoriesSection: React.FC<CategoriesSectionProps> = ({
  categories,
  onSelectCategory,
  isAdminLoggedIn = false,
  onOpenAdminCategories,
  onAddCategory,
  onEditCategory,
}) => {
  const getIcon = (name?: string) => {
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
      case 'Sparkles':
        return <Sparkles className="w-6 h-6 text-amber-500" />;
      case 'BookOpen':
        return <BookOpen className="w-6 h-6 text-blue-500" />;
      default:
        return <Code className="w-6 h-6 text-indigo-500" />;
    }
  };

  return (
    <section id="categories-section" className="py-12 md:py-16 border-t border-zinc-200/80 dark:border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold tracking-wider uppercase text-indigo-600 dark:text-indigo-400">
                Taxonomy & Tracks
              </span>
              {isAdminLoggedIn && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>Admin Mode</span>
                </span>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white font-heading mt-1">
              Browse by Category
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Explore organized subject tracks spanning neural models, system kernels, and web architectures.
            </p>
          </div>

          {/* Admin Management Toolbar inside Category Section */}
          {isAdminLoggedIn && (
            <div className="flex items-center gap-2 shrink-0">
              {onAddCategory && (
                <button
                  type="button"
                  onClick={onAddCategory}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-zinc-800 dark:text-zinc-100 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 rounded-xl transition-all cursor-pointer shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Add Category</span>
                </button>
              )}
              {onOpenAdminCategories && (
                <button
                  type="button"
                  onClick={onOpenAdminCategories}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  <Tags className="w-4 h-4" />
                  <span>Manage All Categories ({categories.length})</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.name)}
              className="group p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 hover:border-indigo-500/40 hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between relative"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 group-hover:scale-110 transition-transform">
                    {getIcon(cat.iconName)}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
                      {cat.articleCount} {cat.articleCount === 1 ? 'article' : 'articles'}
                    </span>
                    {/* Admin quick edit / rename button */}
                    {isAdminLoggedIn && onEditCategory && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditCategory(cat);
                        }}
                        title={`Edit / Rename "${cat.name}"`}
                        className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-indigo-600 hover:text-white text-zinc-500 dark:text-zinc-400 transition-colors cursor-pointer shadow-2xs"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
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

          {/* Direct Add New Category Card for Admin */}
          {isAdminLoggedIn && onAddCategory && (
            <div
              onClick={onAddCategory}
              className="group p-6 rounded-2xl border-2 border-dashed border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/20 dark:bg-indigo-950/10 hover:border-indigo-500 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/30 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center text-center min-h-[220px]"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform mb-3 shadow-2xs">
                <Plus className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white font-heading">
                Add New Category
              </h3>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 max-w-xs leading-relaxed">
                Define a new subject track with custom icon and description.
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                <span>Create category</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
